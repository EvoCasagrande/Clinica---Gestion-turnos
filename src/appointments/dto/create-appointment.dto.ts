import { IsDateString, IsNotEmpty, IsUUID } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
    @ApiProperty({ example: 'b7c3f3a2-8c1a-4f7b-9f0e-123456789abc', description: 'ID del perfil médico' })
    @IsUUID()
    @IsNotEmpty()
    doctorId: string;

    @ApiProperty({ example: '2030-01-15T14:30:00.000Z', description: 'Inicio en formato ISO 8601' })
    @IsDateString()
    @IsNotEmpty()
    startsAt: string;

    @ApiProperty({ example: '2030-01-15T15:00:00.000Z', description: 'Fin en formato ISO 8601' })
    @IsDateString()
    @IsNotEmpty()
    endsAt: string;
}
