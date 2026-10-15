import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MlForecastService } from './ml-forecast.service';
import { MlForecastController } from './ml-forecast.controller';
import { SalesTarget } from '../sales-target/entities/sales-target.entity';
import { Region } from '../region/entities/region.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  controllers: [MlForecastController],
  providers: [MlForecastService],
  imports: [TypeOrmModule.forFeature([SalesTarget, Region, Product]), ConfigModule],
})
export class MlForecastModule {}
