import { Controller, Get, Post, Body, Patch, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service.js';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto.js';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { RoleProtected } from '../auth/decorators/roles.decorator.js';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import type { PublicUser } from '../users/types/public-user.js';

@Controller('appointments')
@ApiTags('appointments')
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @RoleProtected(ValidRoles.PATIENT, ValidRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Reservar un turno' })
  @ApiResponse({ status: 201, description: 'Turno reservado correctamente' })
  @ApiResponse({ status: 409, description: 'El horario no está disponible o ya fue reservado' })
  create(
    @Body() body: CreateAppointmentDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.appointmentsService.create(user, body);
  }

  @RoleProtected(ValidRoles.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('my')
  @ApiOperation({ summary: 'Listar mis turnos' })
  @ApiResponse({ status: 200, description: 'Turnos del usuario autenticado' })
  getMyAppointments(@CurrentUser() user: PublicUser) {
    return this.appointmentsService.getMyAppointments(user);
  }

  @RoleProtected(ValidRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Listar todos los turnos' })
  @ApiResponse({ status: 200, description: 'Todos los turnos de la clínica' })
  getAll() {
    return this.appointmentsService.getAll();
  }

  @RoleProtected(ValidRoles.ADMIN, ValidRoles.DOCTOR, ValidRoles.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Consultar un turno' })
  @ApiResponse({ status: 200, description: 'Turno encontrado' })
  @ApiResponse({ status: 404, description: 'Turno no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: PublicUser) {
    return this.appointmentsService.findOne(user, id);
  }

  @RoleProtected(ValidRoles.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/reschedule')
  @ApiOperation({ summary: 'Reprogramar un turno' })
  @ApiResponse({ status: 200, description: 'Turno reprogramado correctamente' })
  @ApiResponse({ status: 409, description: 'El nuevo horario no está disponible' })
  reschedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: RescheduleAppointmentDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.appointmentsService.reschedule(user, id, body);
  }

  @RoleProtected(ValidRoles.ADMIN, ValidRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Cambiar el estado de un turno' })
  @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateAppointmentStatusDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.appointmentsService.updateStatus(user, id, body);
  }

  @RoleProtected(ValidRoles.ADMIN, ValidRoles.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar un turno' })
  @ApiResponse({ status: 200, description: 'Turno cancelado correctamente' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: PublicUser,
  ) {
    return this.appointmentsService.cancel(user, id);
  }
}
