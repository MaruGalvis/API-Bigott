import { PartialType } from '@nestjs/mapped-types';
import { CreateSalesTargetDto } from './create-sales-target.dto';

export class UpdateSalesTargetDto extends PartialType(CreateSalesTargetDto) {}
