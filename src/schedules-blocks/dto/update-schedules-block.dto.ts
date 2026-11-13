import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateSchedulesBlockDto {
    @IsDateString()
    @IsNotEmpty()
    @IsOptional()
    startsAt?: string;

    @IsDateString()
    @IsNotEmpty()
    @IsOptional()
    endsAt?: string;
}
