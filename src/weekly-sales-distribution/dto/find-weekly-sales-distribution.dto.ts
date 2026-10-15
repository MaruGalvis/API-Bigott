import { Type } from "class-transformer";
import { IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto";

export class FindWeeklySalesDistributionDto extends PaginationDto {

    @IsOptional()
    @IsUUID()
    branchId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    month?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    year?: number;
}
