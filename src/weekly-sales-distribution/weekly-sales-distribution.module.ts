import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeeklySalesDistributionService } from './weekly-sales-distribution.service';
import { WeeklySalesDistributionController } from './weekly-sales-distribution.controller';
import { WeeklySalesDistribution } from './entities/weekly-sales-distribution.entity';
import { Branch } from '../branch/entities/branch.entity';
import { Product } from '../product/entities/product.entity';
import { MonthlySalesDistribution } from '../monthly-sales-distribution/entities/monthly-sales-distribution.entity';

@Module({
  controllers: [WeeklySalesDistributionController],
  providers: [WeeklySalesDistributionService],
  imports: [TypeOrmModule.forFeature([WeeklySalesDistribution, Branch, Product, MonthlySalesDistribution])],
})
export class WeeklySalesDistributionModule {}
