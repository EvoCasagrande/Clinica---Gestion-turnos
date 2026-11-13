import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateSpecialtyDto {
    
    @IsString()
    @IsNotEmpty()
    @MaxLength(30, { message: 'El nombre no debe superar los 30 caracteres'})
    name: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @MaxLength(200, { message: 'La longitud no debe superar los 200 caracteres'})
    description?: string;
}
