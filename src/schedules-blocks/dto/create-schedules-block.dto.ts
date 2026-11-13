import { IsDateString, IsNotEmpty, IsUUID } from "class-validator";

export class CreateSchedulesBlockDto {
    @IsUUID()
    @IsNotEmpty()
    doctorId: string;

    @IsDateString()
    @IsNotEmpty()
    startsAt: string;

    @IsDateString()
    @IsNotEmpty()
    endsAt: string;
}
