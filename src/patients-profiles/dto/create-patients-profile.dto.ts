import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreatePatientsProfileDto {
    @IsString()
    @MaxLength(30, { message:'El nombre puede tener maximo 30 caracteres' })
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @MaxLength(30, { message:'El apellido puede tener maximo 30 caracteres' })
    @IsNotEmpty()
    lastName: string;
    
    @IsString()
    @IsOptional()
    @MaxLength(30, { message:'El telefono puede tener maximo 30 caracteres' })
    @IsNotEmpty()
    phone?: string;

    @IsDateString()
    @IsOptional()
    @IsNotEmpty()
    birthDate?: string;
}
