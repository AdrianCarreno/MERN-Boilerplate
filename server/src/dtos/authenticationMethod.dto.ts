import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ObjectId } from 'mongoose'

export class AddAutheticationMethodDto {
    @IsMongoId()
    @IsNotEmpty()
    userId: ObjectId

    @IsString()
    @IsNotEmpty()
    type: string

    @IsString()
    @IsOptional()
    password: string

    @IsString()
    @IsOptional()
    accessToken: string

    @IsString()
    @IsOptional()
    refreshToken: string

    @IsString()
    @IsOptional()
    expiresIn: number
}

export class UpdateAutheticationMethodDto {
    @IsString()
    @IsNotEmpty()
    userId: ObjectId

    @IsString()
    @IsNotEmpty()
    type: string

    @IsString()
    @IsOptional()
    password: string

    @IsString()
    @IsOptional()
    accessToken: string

    @IsString()
    @IsOptional()
    refreshToken: string

    @IsString()
    @IsOptional()
    expiresIn: number
}

export class DeleteAutheticationMethodDto {
    @IsString()
    @IsNotEmpty()
    userId: ObjectId

    @IsString()
    @IsNotEmpty()
    type: string
}
