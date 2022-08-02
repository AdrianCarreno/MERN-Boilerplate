import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { Organization } from '@/interfaces/roles.interface'

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    organizationId?: Organization

    @IsNotEmpty()
    resources: object

    @IsString()
    @IsOptional()
    description: string
}

export class CreateGlobalRoleDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    resources: object

    @IsString()
    @IsOptional()
    description: string
}

export class UpdateRoleDto {
    @IsString()
    @IsOptional()
    name: string

    @IsOptional()
    resources: object

    @IsString()
    @IsOptional()
    description: string
}
