import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreatePatientsProfileDto } from './dto/create-patients-profile.dto.js';
import type { UpdatePatientsProfileDto } from './dto/update-patients-profile.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { PatientProfile } from '../generated/prisma/client.js';

@Injectable()
export class PatientsProfilesService {
  constructor(
    private readonly prismaService: PrismaService
  ){}


  async me(userId: string): Promise<PatientProfile> {
    const profile = await this.prismaService.patientProfile.findUnique({
      where: { userId }
    });

    if(!profile) throw new NotFoundException('Perfil de paciente no encontrado')

    return profile;
  }

  findAll(): Promise<PatientProfile[]> {
    return this.prismaService.patientProfile.findMany();
  }

  async findOne(id: string): Promise<PatientProfile> {
    const profile = await this.prismaService.patientProfile.findUnique({
      where: {
        id
      }
    });

    if(!profile) throw new NotFoundException('Perfil de paciente no encontrado')

    return profile
  }

  create(userId: string, body: CreatePatientsProfileDto): Promise<PatientProfile> {
    if(body.birthDate){
      const birthDate = new Date(body.birthDate)
      return this.prismaService.patientProfile.create({
      data: {
        userId,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        birthDate: birthDate
        }
      });
    }
    return this.prismaService.patientProfile.create({
      data: {
        userId,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
      }
    });

  }

  update(userId: string, body: UpdatePatientsProfileDto): Promise<PatientProfile> {
    if(body.birthDate){
      const birthDate = new Date(body.birthDate)
      return this.prismaService.patientProfile.update({
      where: { userId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        birthDate: birthDate
        }
      });
    }
    return this.prismaService.patientProfile.update({
      where: { userId },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone
        }
      });
  }

  async remove(id: string): Promise<void> {
    await this.prismaService.patientProfile.delete({
      where: { id }
    });
  }
}
