import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeeklySalesDistribution } from './entities/weekly-sales-distribution.entity';
import { Branch } from '../branch/entities/branch.entity';
import { Product } from '../product/entities/product.entity';
import { MonthlySalesDistribution } from '../monthly-sales-distribution/entities/monthly-sales-distribution.entity';
import { CreateWeeklySalesDistributionDto } from './dto/create-weekly-sales-distribution.dto';
import { UpdateWeeklySalesDistributionDto } from './dto/update-weekly-sales-distribution.dto';
import { FindWeeklySalesDistributionDto } from './dto/find-weekly-sales-distribution.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';

export interface PivotWeeklySalesDistributionRow {
  product: string;
  values: Record<string, number>;
  sop: number;
  dailySalesAverage: number;
}

@Injectable()
export class WeeklySalesDistributionService {
  constructor(
    @InjectRepository(WeeklySalesDistribution)
    private readonly weeklySalesDistributionRepository: Repository<WeeklySalesDistribution>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(MonthlySalesDistribution)
    private readonly monthlySalesDistributionRepository: Repository<MonthlySalesDistribution>,
  ) {}

  async create(createWeeklySalesDistributionDto: CreateWeeklySalesDistributionDto): Promise<WeeklySalesDistribution> {
    const { branchId, productId, month, year } = createWeeklySalesDistributionDto;

    const [branch, product] = await Promise.all([
      this.branchRepository.findOneBy({ branchId }),
      this.productRepository.findOneBy({ productId }),
    ]);

    if (!branch) throw new NotFoundException(`Branch with id ${branchId} not found`);
    if (!product) throw new NotFoundException(`Product with id ${productId} not found`);

    const weeklySalesDistribution = this.weeklySalesDistributionRepository.create({
      ...createWeeklySalesDistributionDto,
      sop: 0,
      weeklyQuantity: 0,
    });

    let saved: WeeklySalesDistribution;
    try {
      saved = await this.weeklySalesDistributionRepository.save(weeklySalesDistribution);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new BadRequestException(
          `A distribution for that branch/product already exists for ${createWeeklySalesDistributionDto.workingWeeks} ${month}/${year}`,
        );
      }
      throw error;
    }

    await this.recalculateGroupSop(
      branchId,
      productId,
      month,
      year,
      createWeeklySalesDistributionDto.dailySalesAverage,
      createWeeklySalesDistributionDto.totalWorkingDays,
    );
    return this.findOne(saved.weeklySalesDistributionId);
  }

  async findAll(findDto: FindWeeklySalesDistributionDto): Promise<PaginatedResult<WeeklySalesDistribution>> {
    const { page = 1, limit = 10, branchId, month, year } = findDto;

    const [data, total] = await this.weeklySalesDistributionRepository.findAndCount({
      where: { ...(branchId && { branchId }), ...(month && { month }), ...(year && { year }) },
      skip: (page - 1) * limit,
      take: limit,
      relations: { branch: true, product: true },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<WeeklySalesDistribution> {
    const weeklySalesDistribution = await this.weeklySalesDistributionRepository.findOne({
      where: { weeklySalesDistributionId: id },
      relations: { branch: true, product: true },
    });

    if (!weeklySalesDistribution) {
      throw new NotFoundException(`Weekly sales distribution with id ${id} not found`);
    }

    return weeklySalesDistribution;
  }

  async update(
    id: string,
    updateWeeklySalesDistributionDto: UpdateWeeklySalesDistributionDto,
  ): Promise<WeeklySalesDistribution> {
    const weeklySalesDistribution = await this.findOne(id);
    const previousGroup = {
      branchId: weeklySalesDistribution.branchId,
      productId: weeklySalesDistribution.productId,
      month: weeklySalesDistribution.month,
      year: weeklySalesDistribution.year,
    };

    Object.assign(weeklySalesDistribution, updateWeeklySalesDistributionDto);

    try {
      await this.weeklySalesDistributionRepository.save(weeklySalesDistribution);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new BadRequestException('A distribution for that branch/product/week/month already exists');
      }
      throw error;
    }

    await this.recalculateGroupSop(
      weeklySalesDistribution.branchId,
      weeklySalesDistribution.productId,
      weeklySalesDistribution.month,
      weeklySalesDistribution.year,
      updateWeeklySalesDistributionDto.dailySalesAverage,
      updateWeeklySalesDistributionDto.totalWorkingDays,
    );

    const groupChanged =
      previousGroup.branchId !== weeklySalesDistribution.branchId ||
      previousGroup.productId !== weeklySalesDistribution.productId ||
      previousGroup.month !== weeklySalesDistribution.month ||
      previousGroup.year !== weeklySalesDistribution.year;

    if (groupChanged) {
      await this.recalculateGroupSop(previousGroup.branchId, previousGroup.productId, previousGroup.month, previousGroup.year);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const weeklySalesDistribution = await this.findOne(id);
    const { branchId, productId, month, year } = weeklySalesDistribution;

    await this.weeklySalesDistributionRepository.remove(weeklySalesDistribution);
    await this.recalculateGroupSop(branchId, productId, month, year);
  }

  async getPivot(branchId: string, month: number, year: number): Promise<PivotWeeklySalesDistributionRow[]> {
    const weeks = await this.weeklySalesDistributionRepository.find({
      where: { branchId, month, year },
      relations: { product: true },
      order: { product: { name: 'ASC' } },
    });

    const rowsByProduct = new Map<string, PivotWeeklySalesDistributionRow>();

    for (const week of weeks) {
      const productName = week.product.name;

      if (!rowsByProduct.has(productName)) {
        rowsByProduct.set(productName, {
          product: productName,
          values: {},
          sop: week.sop,
          dailySalesAverage: week.dailySalesAverage,
        });
      }

      rowsByProduct.get(productName)!.values[week.workingWeeks] = week.weeklyQuantity;
    }

    return Array.from(rowsByProduct.values());
  }

  private async recalculateGroupSop(
    branchId: string,
    productId: string,
    month: number,
    year: number,
    dailySalesAverage?: number,
    totalWorkingDays?: number,
  ): Promise<void> {
    const siblings = await this.weeklySalesDistributionRepository.find({
      where: { branchId, productId, month, year },
    });

    if (siblings.length === 0) return;

    const dsaSop = dailySalesAverage ?? siblings[0].dailySalesAverage;
    const totalDays = totalWorkingDays ?? siblings[0].totalWorkingDays;
    const sop = totalDays * dsaSop;

    for (const week of siblings) {
      week.dailySalesAverage = dsaSop;
      week.totalWorkingDays = totalDays;
      week.sop = sop;
      week.weeklyQuantity = week.weight * sop;
    }

    await this.weeklySalesDistributionRepository.save(siblings);
    await this.recalculateMonthlyQuantities(siblings);
  }

  /** Monthly Distribution stores monthlyQuantity as a snapshot (dailyWeight * weeklyQuantity)
   * taken when the daily split was last saved. Whenever the underlying weekly SOP/DSA changes,
   * those snapshots go stale unless we recompute them here too. */
  private async recalculateMonthlyQuantities(weeks: WeeklySalesDistribution[]): Promise<void> {
    const weeklyIds = weeks.map((w) => w.weeklySalesDistributionId);
    if (weeklyIds.length === 0) return;

    const monthlyRows = await this.monthlySalesDistributionRepository
      .createQueryBuilder('monthly')
      .where('monthly.weeklySalesDistributionId IN (:...weeklyIds)', { weeklyIds })
      .getMany();

    if (monthlyRows.length === 0) return;

    const weeklyQuantityById = new Map(weeks.map((w) => [w.weeklySalesDistributionId, w.weeklyQuantity]));

    for (const row of monthlyRows) {
      const weeklyQuantity = weeklyQuantityById.get(row.weeklySalesDistributionId!) ?? 0;
      row.monthlyQuantity = row.dailyWeight * weeklyQuantity;
    }

    await this.monthlySalesDistributionRepository.save(monthlyRows);
  }
}
