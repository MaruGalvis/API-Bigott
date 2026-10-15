import { PartialType } from '@nestjs/mapped-types';
import { CreateWeeklySalesDistributionDto } from './create-weekly-sales-distribution.dto';

export class UpdateWeeklySalesDistributionDto extends PartialType(CreateWeeklySalesDistributionDto) {}
