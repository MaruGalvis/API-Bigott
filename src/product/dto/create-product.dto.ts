import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { PackType } from "../emuns/pack-type.enum";

export class CreateProductDto {
    
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsEnum(PackType)
    @IsNotEmpty()
    type!: PackType;


}
