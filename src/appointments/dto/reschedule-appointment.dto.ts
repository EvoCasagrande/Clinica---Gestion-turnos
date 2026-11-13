import { IsDateString, IsNotEmpty } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class RescheduleAppointmentDto {
    @ApiProperty({ example: '2030-01-15T16:00:00.000Z' })
    @ApiProperty({ example: '2030-01-15T16:30:00.000Z' })
    @IsDateString()
    @IsNotEmpty()
    startsAt: string;

    @IsDateString()
    @IsNotEmpty()
    endsAt: string;
}
