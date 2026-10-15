import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsNotEmpty, IsNumber, Min, ValidateNested } from 'class-validator';

export class MlForecastItemDto {
  @IsNotEmpty()
  region!: string;

  @IsNotEmpty()
  product!: string;

  @IsNumber()
  @Min(0)
  predicted_target!: number;

  @IsDateString()
  period!: string;
}

export class SaveMlForecastDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MlForecastItemDto)
  objetivos!: MlForecastItemDto[];
}
