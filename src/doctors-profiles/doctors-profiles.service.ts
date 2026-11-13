import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDoctorsProfileDto } from './dto/create-doctors-profile.dto.js';
import { UpdateDoctorsProfileDto } from './dto/update-doctors-profile.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { DoctorProfile, Role } from '../generated/prisma/client.js';

@Injectable()
export class DoctorsProfilesService {
  constructor(private readonly prismaService: PrismaService){}

  findAll(): Promise<DoctorProfile[]> {
    return this.prismaService.doctorProfile.findMany();
  }

  async findOne(id: string): Promise<DoctorProfile> {
    const doctorProfile = await this.prismaService.doctorProfile.findUnique({
      where: { id }
    });

    if(!doctorProfile) throw new NotFoundException('Perfil médico no encontrado')

    return doctorProfile
  }

  async create(body: CreateDoctorsProfileDto): Promise<DoctorProfile> {
    const user = await this.prismaService.user.findUnique({
      where: { id: body.userId },
      select: { id: true, role: true }
    })

    if(!user) throw new NotFoundException('El userId dado no pertenece a ningun usuario')
    
    if(user.role !== Role.DOCTOR) throw new BadRequestException('El usuario indicado debe tener el rol DOCTOR')

    return this.prismaService.doctorProfile.create({
      data: body
    });
  }

  update(id: string, body: UpdateDoctorsProfileDto): Promise<DoctorProfile> {
    return this.prismaService.doctorProfile.update({
      where: { id },
      data: body
    });
  }

  async remove(id: string): Promise<void> {
    await this.prismaService.doctorProfile.delete({
      where: { id }
    });
  }
}
