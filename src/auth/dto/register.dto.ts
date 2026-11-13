import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'paciente@clinica.com', description: 'Email del paciente' })
    @ApiProperty({ example: 'Password123!', minLength: 8, maxLength: 50 })
    @IsString()
    @IsEmail({}, {message: 'El email debe tener un formato valido.'})
    email!: string;

    @IsString()
    @MinLength(8, { message: 'La contrasena debe tener minimo 8 caracteres' })
    @MaxLength(50, { message: 'La contrasena debe tener maximo 50 caracteres' })
    password!: string;
}
