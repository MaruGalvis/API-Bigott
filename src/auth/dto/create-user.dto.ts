import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, {
    message: 'password must contain at least one uppercase letter, one lowercase letter and one number',
  })
  password!: string;

  @IsString()
  @MinLength(1)
  name!: string;
}
