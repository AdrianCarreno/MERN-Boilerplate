import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ObjectId } from 'mongoose'
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

    @IsOptional()
    @IsNotEmpty()
    roles: Array<string>
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
    @IsString()
    @IsNotEmpty()
    password: string

    @IsOptional()
    @IsNotEmpty()
    roles: Array<ObjectId>
}

export class LoginUserDto {
    @IsEmail()
    email: string

    @IsString()
    password: string
}

export class addRoleDto {
    @IsString()
    @IsNotEmpty()
    _id: string
}
