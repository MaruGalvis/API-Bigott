import { IsInt, IsNotEmpty, IsNumber, IsUUID, Max, Min } from "class-validator";

export class CreateSalesTargetDto {

    @IsUUID()
    @IsNotEmpty()
    regionId!: string;

    @IsUUID()
    @IsNotEmpty()
    productId!: string;

    @IsNumber()
    @Min(0)
    targetSalesVolume!: number;

    @IsInt()
    @Min(1)
    @Max(12)
    month!: number;

    @IsInt()
    @Min(2000)
    year!: number;
}
