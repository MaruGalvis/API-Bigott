import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateBranchDto {

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsUUID()
    @IsNotEmpty()
    regionId!: string;
}
