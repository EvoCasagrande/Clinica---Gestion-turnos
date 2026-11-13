import { Injectable } from '@nestjs/common';
import { CreateDoctorsSpecialtyDto } from './dto/create-doctors-specialty.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DoctorSpecialty } from '../generated/prisma/client.js';

@Injectable()
export class DoctorsSpecialtiesService {
  constructor(private readonly prismaService: PrismaService){}

  findAll(): Promise<DoctorSpecialty[]> {
    return this.prismaService.doctorSpecialty.findMany();
  }

  create(body: CreateDoctorsSpecialtyDto): Promise<DoctorSpecialty> {
    return this.prismaService.doctorSpecialty.create({
      data: body
    })
  }

  async remove(doctorId: string, specialtyId: string): Promise<void> {
    await this.prismaService.doctorSpecialty.delete({
      where: {
        doctorId_specialtyId: {
          doctorId,
          specialtyId
        }
      }
    });
  }
}
