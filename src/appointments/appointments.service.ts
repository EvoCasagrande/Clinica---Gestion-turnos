import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Role } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto.js';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto.js';
import type { PublicUser } from '../users/types/public-user.js';
import type { Appointment } from '../generated/prisma/client.js';

@Injectable()
export class AppointmentsService {
    constructor(private readonly prismaService: PrismaService) {}

    async create(user: PublicUser, body: CreateAppointmentDto): Promise<Appointment> {
        const patientProfile = await this.prismaService.patientProfile.findUnique({
            where: { userId: user.id },
        });

        if (!patientProfile) {
            throw new NotFoundException('Debes completar tu perfil de paciente antes de reservar un turno');
        }

        const doctorProfile = await this.prismaService.doctorProfile.findUnique({
            where: { id: body.doctorId },
        });

        if (!doctorProfile) {
            throw new NotFoundException('Médico no encontrado');
        }

        const startsAt = new Date(body.startsAt);
        const endsAt = new Date(body.endsAt);
        this.validateDates(startsAt, endsAt);
        await this.checkAvailability(body.doctorId, startsAt, endsAt);
        await this.checkAppointmentOverlap(body.doctorId, startsAt, endsAt);

        return this.prismaService.appointment.create({
            data: {
                doctorId: body.doctorId,
                patientId: patientProfile.id,
                startsAt,
                endsAt,
                status: AppointmentStatus.SCHEDULED,
            },
        });
    }

    getAll(): Promise<Appointment[]> {
        return this.prismaService.appointment.findMany({
            orderBy: { startsAt: 'asc' },
        });
    }

    async getMyAppointments(user: PublicUser): Promise<Appointment[]> {
        if (user.role === Role.PATIENT) {
            const patientProfile = await this.prismaService.patientProfile.findUnique({
                where: { userId: user.id },
                select: { id: true },
            });

            if (!patientProfile) {
                throw new NotFoundException('Perfil de paciente no encontrado');
            }

            return this.prismaService.appointment.findMany({
                where: { patientId: patientProfile.id },
                orderBy: { startsAt: 'asc' },
            });
        }

        if (user.role === Role.DOCTOR) {
            const doctorProfile = await this.prismaService.doctorProfile.findUnique({
                where: { userId: user.id },
                select: { id: true },
            });

            if (!doctorProfile) {
                throw new NotFoundException('Perfil médico no encontrado');
            }

            return this.prismaService.appointment.findMany({
                where: { doctorId: doctorProfile.id },
                orderBy: { startsAt: 'asc' },
            });
        }

        throw new ForbiddenException('No tenés permisos para consultar tus turnos');
    }

    async findOne(user: PublicUser, appointmentId: string): Promise<Appointment> {
        const appointment = await this.prismaService.appointment.findUnique({
            where: { id: appointmentId },
        });

        if (!appointment) {
            throw new NotFoundException('Turno no encontrado');
        }

        await this.checkAppointmentAccess(user, appointment);
        return appointment;
    }

    async reschedule(user: PublicUser, appointmentId: string, body: RescheduleAppointmentDto): Promise<Appointment> {
        const appointment = await this.findOne(user, appointmentId);

        if (user.role !== Role.PATIENT) {
            throw new ForbiddenException('Solo el paciente puede reprogramar este turno');
        }

        if (appointment.status !== AppointmentStatus.SCHEDULED) {
            throw new BadRequestException('Solo se pueden reprogramar turnos programados');
        }

        const startsAt = new Date(body.startsAt);
        const endsAt = new Date(body.endsAt);
        this.validateDates(startsAt, endsAt);
        await this.checkAvailability(appointment.doctorId, startsAt, endsAt);
        await this.checkAppointmentOverlap(appointment.doctorId, startsAt, endsAt, appointmentId);

        return this.prismaService.appointment.update({
            where: { id: appointmentId },
            data: { startsAt, endsAt },
        });
    }

    async updateStatus(
        user: PublicUser,
        appointmentId: string,
        body: UpdateAppointmentStatusDto,
    ): Promise<Appointment> {
        const appointment = await this.findOne(user, appointmentId);

        if (user.role === Role.DOCTOR && appointment.status !== AppointmentStatus.SCHEDULED) {
            throw new BadRequestException('Solo se puede cambiar el estado de un turno programado');
        }

        if (
            user.role === Role.DOCTOR &&
            body.status !== AppointmentStatus.COMPLETED &&
            body.status !== AppointmentStatus.NO_SHOW
        ) {
            throw new ForbiddenException('El médico solo puede marcar el turno como completado o ausente');
        }

        return this.prismaService.appointment.update({
            where: { id: appointmentId },
            data: { status: body.status },
        });
    }

    async cancel(user: PublicUser, appointmentId: string): Promise<Appointment> {
        const appointment = await this.findOne(user, appointmentId);

        if (appointment.status !== AppointmentStatus.SCHEDULED) {
            throw new BadRequestException('Solo se pueden cancelar turnos programados');
        }

        return this.prismaService.appointment.update({
            where: { id: appointmentId },
            data: { status: AppointmentStatus.CANCELLED },
        });
    }

    private validateDates(startsAt: Date, endsAt: Date): void {
        if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
            throw new BadRequestException('Las fechas del turno no son válidas');
        }

        if (startsAt >= endsAt) {
            throw new BadRequestException('startsAt debe ser anterior a endsAt');
        }

        if (startsAt <= new Date()) {
            throw new BadRequestException('El turno debe comenzar en el futuro');
        }
    }

    private async checkAvailability(doctorId: string, startsAt: Date, endsAt: Date): Promise<void> {
        const scheduleBlock = await this.prismaService.scheduleBlock.findFirst({
            where: {
                doctorId,
                startsAt: { lte: startsAt },
                endsAt: { gte: endsAt },
            },
        });

        if (!scheduleBlock) {
            throw new ConflictException('El médico no tiene disponibilidad para ese horario');
        }
    }

    private async checkAppointmentOverlap(
        doctorId: string,
        startsAt: Date,
        endsAt: Date,
        excludedAppointmentId?: string,
    ): Promise<void> {
        const overlappingAppointment = await this.prismaService.appointment.findFirst({
            where: {
                doctorId,
                status: { not: AppointmentStatus.CANCELLED },
                startsAt: { lt: endsAt },
                endsAt: { gt: startsAt },
                ...(excludedAppointmentId ? { id: { not: excludedAppointmentId } } : {}),
            },
        });

        if (overlappingAppointment) {
            throw new ConflictException('El horario ya está reservado');
        }
    }

    private async checkAppointmentAccess(user: PublicUser, appointment: Appointment): Promise<void> {
        if (user.role === Role.ADMIN) return;

        if (user.role === Role.PATIENT) {
            const patientProfile = await this.prismaService.patientProfile.findUnique({
                where: { userId: user.id },
                select: { id: true },
            });

            if (!patientProfile || patientProfile.id !== appointment.patientId) {
                throw new ForbiddenException('No podés acceder a este turno');
            }

            return;
        }

        if (user.role === Role.DOCTOR) {
            const doctorProfile = await this.prismaService.doctorProfile.findUnique({
                where: { userId: user.id },
                select: { id: true },
            });

            if (!doctorProfile || doctorProfile.id !== appointment.doctorId) {
                throw new ForbiddenException('No podés acceder a este turno');
            }

            return;
        }

        throw new ForbiddenException('No tenés permisos para acceder a este turno');
    }
}
