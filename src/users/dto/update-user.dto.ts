import { IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsEmail({}, {message: 'El email debe tener un formato valido.'})
    email?: string;
}
