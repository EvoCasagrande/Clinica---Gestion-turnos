import { Controller, Get, Post, Body, Param, Delete, ParseUUIDPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { DoctorsSpecialtiesService } from './doctors-specialties.service.js';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateDoctorsSpecialtyDto } from './dto/create-doctors-specialty.dto.js';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RoleProtected } from '../auth/decorators/roles.decorator.js';

@Controller('doctors-specialties')
@ApiTags('doctors-specialties')
@ApiBearerAuth()
export class DoctorsSpecialtiesController {
  constructor(private readonly doctorsSpecialtiesService: DoctorsSpecialtiesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar relaciones entre médicos y especialidades' })
  @ApiResponse({ status: 200, description: 'Relaciones encontradas' })
  findAll() {
    return this.doctorsSpecialtiesService.findAll();
  }

  @RoleProtected(ValidRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Asignar una especialidad a un médico' })
  @ApiResponse({ status: 201, description: 'Especialidad asignada correctamente' })
  @ApiResponse({ status: 409, description: 'La relación ya existe' })
  create(@Body() createDoctorsSpecialtyDto: CreateDoctorsSpecialtyDto) {
    return this.doctorsSpecialtiesService.create(createDoctorsSpecialtyDto);
  }

  @RoleProtected(ValidRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':doctorId/:specialtyId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Quitar una especialidad a un médico' })
  @ApiResponse({ status: 204, description: 'Relación eliminada correctamente' })
  @ApiResponse({ status: 404, description: 'Relación no encontrada' })
  remove(
    @Param('doctorId', ParseUUIDPipe) doctorId: string,
    @Param('specialtyId', ParseUUIDPipe) specialtyId: string
  ) {
    return this.doctorsSpecialtiesService.remove(doctorId, specialtyId);
  }
}
