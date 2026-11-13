import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, {message: 'El email debe tener un formato valido.'})
    email!: string;

    @IsString()
    @MinLength(8, { message: 'La contrasena debe tener minimo 8 caracteres' })
    password!: string;
}
