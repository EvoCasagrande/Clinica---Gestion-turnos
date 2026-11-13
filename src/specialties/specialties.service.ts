import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto.js';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Specialty } from '../generated/prisma/client.js';

@Injectable()
export class SpecialtiesService {
  constructor(private readonly prismaService: PrismaService){}

  findAll(): Promise<Specialty[]> {
    return this.prismaService.specialty.findMany()
  }

  async findOne(id: string): Promise<Specialty> {
    const specialty = await this.prismaService.specialty.findUnique({
      where: { id }
    })

    if(!specialty) throw new NotFoundException('Especialidad no encontrada')

    return specialty
  }

  create(body: CreateSpecialtyDto): Promise<Specialty> {
    return this.prismaService.specialty.create({
      data: body
    })
  }

  update(id: string, body: UpdateSpecialtyDto): Promise<Specialty> {
    return this.prismaService.specialty.update({
      where: {id},
      data: body
    })
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.specialty.delete({
      where: {id}
    })
  }
}
