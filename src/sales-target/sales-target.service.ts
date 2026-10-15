import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { SalesTarget } from './entities/sales-target.entity';
import { Region } from '../region/entities/region.entity';
import { Product } from '../product/entities/product.entity';
import { CreateSalesTargetDto } from './dto/create-sales-target.dto';
import { UpdateSalesTargetDto } from './dto/update-sales-target.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

export interface ImportSalesTargetSummary {
  rowsImported: number;
  skippedLabels: string[];
}

export interface PivotSalesTargetRow {
  product: string;
  values: Record<string, number>;
}

@Injectable()
export class SalesTargetService {
  constructor(
    @InjectRepository(SalesTarget)
    private readonly salesTargetRepository: Repository<SalesTarget>,
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createSalesTargetDto: CreateSalesTargetDto): Promise<SalesTarget> {
    const salesTarget = this.salesTargetRepository.create(createSalesTargetDto);
    return this.salesTargetRepository.save(salesTarget);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<SalesTarget>> {
    const { page = 1, limit = 10 } = paginationDto;

    const [data, total] = await this.salesTargetRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: { region: true, product: true },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<SalesTarget> {
    const salesTarget = await this.salesTargetRepository.findOne({
      where: { salesTargetId: id },
      relations: { region: true, product: true },
    });

    if (!salesTarget) {
      throw new NotFoundException(`Sales target with id ${id} not found`);
    }

    return salesTarget;
  }

  async update(id: string, updateSalesTargetDto: UpdateSalesTargetDto): Promise<SalesTarget> {
    const salesTarget = await this.findOne(id);
    Object.assign(salesTarget, updateSalesTargetDto);
    return this.salesTargetRepository.save(salesTarget);
  }

  async remove(id: string): Promise<void> {
    const salesTarget = await this.findOne(id);
    await this.salesTargetRepository.remove(salesTarget);
  }

  async getLatestPeriod(): Promise<{ month: number; year: number } | null> {
    const latest = await this.salesTargetRepository.find({
      order: { year: 'DESC', month: 'DESC' },
      take: 1,
    });

    if (latest.length === 0) return null;

    return { month: latest[0].month, year: latest[0].year };
  }

  async getPivot(month: number, year: number): Promise<PivotSalesTargetRow[]> {
    const salesTargets = await this.salesTargetRepository.find({
      where: { month, year },
      relations: { region: true, product: true },
      order: { product: { name: 'ASC' }, region: { name: 'ASC' } },
    });

    const rowsByProduct = new Map<string, PivotSalesTargetRow>();

    for (const salesTarget of salesTargets) {
      const productName = salesTarget.product.name;

      if (!rowsByProduct.has(productName)) {
        rowsByProduct.set(productName, { product: productName, values: {} });
      }

      rowsByProduct.get(productName)!.values[salesTarget.region.name] = salesTarget.targetSalesVolume;
    }

    return Array.from(rowsByProduct.values());
  }
  
  async importFromExcel(buffer: Buffer, month: number, year: number): Promise<ImportSalesTargetSummary> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('The Excel file has no worksheets');
    }

    const [regions, products] = await Promise.all([
      this.regionRepository.find(),
      this.productRepository.find(),
    ]);

    const regionByName = new Map(regions.map((region) => [this.normalize(region.name), region]));
    const productByName = new Map(products.map((product) => [this.normalize(product.name), product]));

    const regionColumns = new Map<number, Region>();
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      if (colNumber === 1) return;
      const region = regionByName.get(this.normalize(String(cell.value ?? '')));
      if (region) {
        regionColumns.set(colNumber, region);
      }
    });

    if (regionColumns.size === 0) {
      throw new BadRequestException(
        'No column header matched an existing region name. Expected the header row to contain region names.',
      );
    }

    const rowsToUpsertByKey = new Map<string, Partial<SalesTarget>>();
    const skippedLabels: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const rawLabel = row.getCell(1).value;
      const label = this.normalize(String(rawLabel ?? ''));
      if (!label) return;

      const product = productByName.get(label);
      if (!product) {
        skippedLabels.push(String(rawLabel));
        return;
      }

      for (const [colNumber, region] of regionColumns) {
        const targetSalesVolume = this.parseNumericCell(row.getCell(colNumber).value);
        if (targetSalesVolume === null) continue;

        rowsToUpsertByKey.set(`${product.productId}|${region.regionId}`, {
          regionId: region.regionId,
          productId: product.productId,
          month,
          year,
          targetSalesVolume,
        });
      }
    });

    const rowsToUpsert = Array.from(rowsToUpsertByKey.values());

    if (rowsToUpsert.length === 0) {
      throw new BadRequestException('No valid SKU/region values were found in the file');
    }

    await this.salesTargetRepository.upsert(rowsToUpsert, {
      conflictPaths: ['regionId', 'productId', 'month', 'year'],
    });

    return { rowsImported: rowsToUpsert.length, skippedLabels };
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  private parseNumericCell(raw: ExcelJS.CellValue): number | null {
    if (raw === null || raw === undefined) return null;

    if (typeof raw === 'number') return raw;

    if (typeof raw === 'object' && 'result' in raw) {
      return this.parseNumericCell((raw as ExcelJS.CellFormulaValue).result ?? null);
    }

    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed === '' || trimmed === '-') return null;
      const numeric = Number(trimmed.replace(/[^0-9.-]/g, ''));
      return Number.isFinite(numeric) ? numeric : null;
    }

    return null;
  }
}
