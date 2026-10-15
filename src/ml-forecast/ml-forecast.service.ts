import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesTarget } from '../sales-target/entities/sales-target.entity';
import { MlForecastItemDto } from './dto/save-ml-forecast.dto';
import { Region } from '../region/entities/region.entity';
import { Product } from '../product/entities/product.entity';

export interface MlGenerateResponse {
  period: string;
  objetivos: {
    region: string;
    product: string;
    predicted_target: number;
    period: string;
  }[];
  omitidos?: { region: string; product: string }[];
}

export interface SaveMlForecastSummary {
  rowsSaved: number;
  skipped: { region: string; product: string; reason: string }[];
}

@Injectable()
export class MlForecastService {
  constructor(
    @InjectRepository(SalesTarget)
    private readonly salesTargetRepository: Repository<SalesTarget>,
    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly configService: ConfigService,
  ) {}

  async generate(): Promise<MlGenerateResponse> {
    const mlApiUrl = this.configService.get<string>('ML_API_URL');
    let response: Response;
    try {
      response = await fetch(`${mlApiUrl}/objetivos/generar`, { method: 'POST' });
    } catch {
      throw new InternalServerErrorException(
        'No se pudo contactar el servicio del modelo de aprendizaje automático',
      );
    }

    if (!response.ok) {
      throw new InternalServerErrorException('El modelo de aprendizaje automático devolvió un error');
    }

    return (await response.json()) as MlGenerateResponse;
  }

  async save(objetivos: MlForecastItemDto[]): Promise<SaveMlForecastSummary> {
    const [regions, products] = await Promise.all([
      this.regionRepository.find(),
      this.productRepository.find(),
    ]);

    const regionByName = new Map(regions.map((region) => [this.normalize(region.name), region]));
    const productByName = new Map(products.map((product) => [this.normalize(product.name), product]));

    const rowsToUpsert: Partial<SalesTarget>[] = [];
    const skipped: { region: string; product: string; reason: string }[] = [];

    for (const item of objetivos) {
      const region = regionByName.get(this.normalize(item.region));
      const product = productByName.get(this.normalize(item.product));

      if (!region || !product) {
        skipped.push({
          region: item.region,
          product: item.product,
          reason: !region ? 'Región no encontrada' : 'Producto no encontrado',
        });
        continue;
      }

      const period = new Date(item.period);
      rowsToUpsert.push({
        regionId: region.regionId,
        productId: product.productId,
        month: period.getUTCMonth() + 1,
        year: period.getUTCFullYear(),
        targetSalesVolume: item.predicted_target,
      });
    }

    if (rowsToUpsert.length === 0) {
      throw new BadRequestException('Ningún objetivo pudo ser mapeado a una región/producto existente');
    }

    await this.salesTargetRepository.upsert(rowsToUpsert, {
      conflictPaths: ['regionId', 'productId', 'month', 'year'],
    });

    return { rowsSaved: rowsToUpsert.length, skipped };
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase();
  }
}
