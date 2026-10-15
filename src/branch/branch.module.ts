import { Module } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { Region } from '../region/entities/region.entity';

@Module({
  controllers: [BranchController],
  providers: [BranchService],
  imports: [
    TypeOrmModule.forFeature([Branch, Region]),
  ],
})
export class BranchModule {}
