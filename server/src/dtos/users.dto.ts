import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    firstName: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    lastName: string

    @IsEmail()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    firstName: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    lastName: string

    @IsOptional()
    @IsEmail()
    email: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    password: string
}

export class LoginUserDto {
    @IsEmail()
    email: string

    @IsString()
    password: string
}
