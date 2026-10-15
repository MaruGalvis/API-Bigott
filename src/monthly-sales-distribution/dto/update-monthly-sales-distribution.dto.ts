import { PartialType } from '@nestjs/mapped-types';
import { CreateMonthlySalesDistributionDto } from './create-monthly-sales-distribution.dto';

export class UpdateMonthlySalesDistributionDto extends PartialType(CreateMonthlySalesDistributionDto) {}
