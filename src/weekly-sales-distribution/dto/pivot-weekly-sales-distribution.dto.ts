import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsUUID, Max, Min } from "class-validator";

export class PivotWeeklySalesDistributionDto {

    @IsUUID()
    @IsNotEmpty()
    branchId!: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    month!: number;

    @Type(() => Number)
    @IsInt()
    @Min(2000)
    year!: number;
}
