import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDoctorsProfileDto {
    @IsString()
    @MaxLength(30, { message:'El nombre puede tener maximo 30 caracteres' })
    @IsNotEmpty()
    @IsOptional()
    firstName?: string;

    @IsString()
    @MaxLength(30, { message:'El apellido puede tener maximo 30 caracteres' })
    @IsNotEmpty()
    @IsOptional()
    lastName?: string;
    
    @IsString()
    @IsNotEmpty()
    @MaxLength(50, { message:'El numero de licencia puede tener maximo 50 caracteres' })
    @IsOptional()
    licenseNumber?: string;
    
    @IsString()
    @MaxLength(500, { message:'La biografia puede tener maximo 500 caracteres' })
    @IsNotEmpty()
    @IsOptional()
    bio?: string;
}
