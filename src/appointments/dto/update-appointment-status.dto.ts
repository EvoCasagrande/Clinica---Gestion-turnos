import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../../generated/prisma/enums.js';

export class UpdateAppointmentStatusDto {
    @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.COMPLETED })
    
    @IsEnum(AppointmentStatus)
    status: AppointmentStatus;
}
