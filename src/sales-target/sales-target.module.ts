import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesTargetService } from './sales-target.service';
import { SalesTargetController } from './sales-target.controller';
import { SalesTarget } from './entities/sales-target.entity';
import { Region } from '../region/entities/region.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  controllers: [SalesTargetController],
  providers: [SalesTargetService],
  imports: [TypeOrmModule.forFeature([SalesTarget, Region, Product])],
})
export class SalesTargetModule {}
