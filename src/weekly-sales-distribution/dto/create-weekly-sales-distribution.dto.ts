import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsUUID, Max, Min } from "class-validator";
import { WeekNumber } from "../enums/week-number.enum";

export class CreateWeeklySalesDistributionDto {

    @IsUUID()
    @IsNotEmpty()
    branchId!: string;

    @IsUUID()
    @IsNotEmpty()
    productId!: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    month!: number;

    @Type(() => Number)
    @IsInt()
    @Min(2000)
    year!: number;

    @IsEnum(WeekNumber)
    workingWeeks!: WeekNumber;

    @IsInt()
    @Min(0)
    workingDays!: number;

    @IsInt()
    @Min(0)
    totalWorkingDays!: number;

    @IsNumber()
    @Min(0)
    weight!: number;

    @IsNumber()
    @Min(0)
    dailySalesAverage!: number;
}
