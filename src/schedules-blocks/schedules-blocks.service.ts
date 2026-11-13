import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSchedulesBlockDto } from './dto/create-schedules-block.dto.js';
import { UpdateSchedulesBlockDto } from './dto/update-schedules-block.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '../generated/prisma/client.js';
import type { ScheduleBlock } from '../generated/prisma/client.js';
import type { PublicUser } from '../users/types/public-user.js';

@Injectable()
export class SchedulesBlocksService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll(): Promise<ScheduleBlock[]> {
    return this.prismaService.scheduleBlock.findMany({
      orderBy: { startsAt: 'asc' },
    });
  }

  async findOne(blockId: string): Promise<ScheduleBlock> {
    const scheduleBlock = await this.prismaService.scheduleBlock.findUnique({
      where: { id: blockId },
    });

    if (!scheduleBlock) {
      throw new NotFoundException('Bloque de disponibilidad no encontrado');
    }

    return scheduleBlock;
  }

  async create(
    user: PublicUser,
    body: CreateSchedulesBlockDto,
  ): Promise<ScheduleBlock> {
    if (user.role !== Role.ADMIN && user.role !== Role.DOCTOR) {
      throw new ForbiddenException('Solo un médico o administrador puede gestionar disponibilidad');
    }

    const doctorProfile = await this.prismaService.doctorProfile.findUnique({
      where: { id: body.doctorId },
      select: { id: true, userId: true },
    });

    if (!doctorProfile) {
      throw new NotFoundException('Perfil médico no encontrado');
    }

    if (user.role === Role.DOCTOR && doctorProfile.userId !== user.id) {
      throw new ForbiddenException(
        'No podés crear disponibilidad para otro médico',
      );
    }

    const startsAt = new Date(body.startsAt);
    const endsAt = new Date(body.endsAt);

    if (startsAt >= endsAt) {
      throw new BadRequestException('startsAt debe ser anterior a endsAt');
    }

    if (startsAt <= new Date()) {
      throw new BadRequestException(
        'La disponibilidad debe comenzar en el futuro',
      );
    }

    const existingBlock = await this.prismaService.scheduleBlock.findFirst({
      where: {
        doctorId: body.doctorId,
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    });

    if (existingBlock) {
      throw new ConflictException(
        'El horario se superpone con otra disponibilidad',
      );
    }

    return this.prismaService.scheduleBlock.create({
      data: {
        doctorId: body.doctorId,
        startsAt,
        endsAt,
      },
    });
  }

  async update(
    user: PublicUser,
    blockId: string,
    body: UpdateSchedulesBlockDto,
  ): Promise<ScheduleBlock> {
    if (user.role !== Role.ADMIN && user.role !== Role.DOCTOR) {
      throw new ForbiddenException('Solo un médico o administrador puede gestionar disponibilidad');
    }

    const block = await this.findOne(blockId);

    const doctorProfile = await this.prismaService.doctorProfile.findUnique({
      where: { id: block.doctorId },
      select: { userId: true },
    });

    if (!doctorProfile) {
      throw new NotFoundException('Perfil médico no encontrado');
    }

    if (user.role === Role.DOCTOR && doctorProfile.userId !== user.id) {
      throw new ForbiddenException(
        'No podés modificar la disponibilidad de otro médico',
      );
    }

    const startsAt = body.startsAt
      ? new Date(body.startsAt)
      : block.startsAt;
    const endsAt = body.endsAt ? new Date(body.endsAt) : block.endsAt;

    if (startsAt >= endsAt) {
      throw new BadRequestException('startsAt debe ser anterior a endsAt');
    }

    if (startsAt <= new Date()) {
      throw new BadRequestException(
        'La disponibilidad debe comenzar en el futuro',
      );
    }

    const existingBlock = await this.prismaService.scheduleBlock.findFirst({
      where: {
        id: { not: blockId },
        doctorId: block.doctorId,
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    });

    if (existingBlock) {
      throw new ConflictException(
        'El horario se superpone con otra disponibilidad',
      );
    }

    return this.prismaService.scheduleBlock.update({
      where: { id: blockId },
      data: {
        startsAt,
        endsAt,
      },
    });
  }

  async remove(user: PublicUser, blockId: string): Promise<void> {
    if (user.role !== Role.ADMIN && user.role !== Role.DOCTOR) {
      throw new ForbiddenException('Solo un médico o administrador puede gestionar disponibilidad');
    }

    const block = await this.findOne(blockId);

    const doctorProfile = await this.prismaService.doctorProfile.findUnique({
      where: { id: block.doctorId },
      select: { userId: true },
    });

    if (!doctorProfile) {
      throw new NotFoundException('Perfil médico no encontrado');
    }

    if (user.role === Role.DOCTOR && doctorProfile.userId !== user.id) {
      throw new ForbiddenException(
        'No podés eliminar la disponibilidad de otro médico',
      );
    }

    await this.prismaService.scheduleBlock.delete({
      where: { id: blockId },
    });
  }
}

