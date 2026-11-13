import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'paciente@clinica.com' })
    @IsEmail({}, {message: 'El email debe tener un formato valido.'})
    email!: string;

    @ApiProperty({ example: 'Password123!' })
    @IsString()
    password!: string;
}
