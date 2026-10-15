import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonthlySalesDistributionService } from './monthly-sales-distribution.service';
import { MonthlySalesDistributionController } from './monthly-sales-distribution.controller';
import { MonthlySalesDistribution } from './entities/monthly-sales-distribution.entity';
import { Branch } from '../branch/entities/branch.entity';
import { Product } from '../product/entities/product.entity';
import { WeeklySalesDistribution } from '../weekly-sales-distribution/entities/weekly-sales-distribution.entity';

@Module({
  controllers: [MonthlySalesDistributionController],
  providers: [MonthlySalesDistributionService],
  imports: [TypeOrmModule.forFeature([MonthlySalesDistribution, Branch, Product, WeeklySalesDistribution])],
})
export class MonthlySalesDistributionModule {}
