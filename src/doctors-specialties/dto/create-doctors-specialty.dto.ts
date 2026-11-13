import { IsUUID } from "class-validator";

export class CreateDoctorsSpecialtyDto {
    @IsUUID()
    doctorId: string;

    @IsUUID()
    specialtyId: string;
}
