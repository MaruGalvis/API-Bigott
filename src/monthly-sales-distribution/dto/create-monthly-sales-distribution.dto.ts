import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsUUID, Min } from "class-validator";
import { DayOfWeek } from "../enums/day-of-week.enum";

export class CreateMonthlySalesDistributionDto {

    @IsUUID()
    @IsNotEmpty()
    branchId!: string;

    @IsUUID()
    @IsNotEmpty()
    productId!: string;

    @IsUUID()
    @IsNotEmpty()
    weeklySalesDistributionId!: string;

    @IsInt()
    @Min(1)
    month!: number;

    @IsInt()
    @Min(2000)
    year!: number;

    @IsEnum(DayOfWeek)
    dayOfWeek!: DayOfWeek;

    @IsNumber()
    @Min(0)
    dailyWeight!: number;
}
