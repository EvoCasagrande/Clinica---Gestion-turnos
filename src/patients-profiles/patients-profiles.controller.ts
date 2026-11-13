import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { PatientsProfilesService } from './patients-profiles.service.js';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePatientsProfileDto } from './dto/create-patients-profile.dto.js';
import { UpdatePatientsProfileDto } from './dto/update-patients-profile.dto.js';
import { RoleProtected } from '../auth/decorators/roles.decorator.js';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { PublicUser } from '../users/types/public-user.js';

@Controller('patients-profiles')
@ApiTags('patients-profiles')
@ApiBearerAuth()
export class PatientsProfilesController {
  constructor(private readonly patientsProfilesService: PatientsProfilesService) {}

  @RoleProtected(ValidRoles.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('me')
  @ApiOperation({ summary: 'Consultar mi perfil de paciente' })
  @ApiResponse({ status: 200, description: 'Perfil del paciente autenticado' })
  me(@CurrentUser() user: PublicUser) {
    return this.patientsProfilesService.me(user.id);
  }

  @RoleProtected(ValidRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  @ApiOperation({ summary: 'Listar perfiles de pacientes' })
  @ApiResponse({ status: 200, description: 'Perfiles encontrados' })
  findAll() {
    return this.patientsProfilesService.findAll();
  }

  @RoleProtected(ValidRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Consultar un perfil de paciente' })
  @ApiResponse({ status: 200, description: 'Perfil encontrado' })
  @ApiResponse({ status: 404, description: 'Perfil no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientsProfilesService.findOne(id);
  }

  @RoleProtected(ValidRoles.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('me')
  @ApiOperation({ summary: 'Crear mi perfil de paciente' })
  @ApiResponse({ status: 201, description: 'Perfil creado correctamente' })
  create(
    @Body() body: CreatePatientsProfileDto,
    @CurrentUser() user: PublicUser
  ) {
    return this.patientsProfilesService.create(user.id, body);
  }

  @RoleProtected(ValidRoles.PATIENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('me')
  @ApiOperation({ summary: 'Modificar mi perfil de paciente' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado correctamente' })
  update( 
    @Body() body: UpdatePatientsProfileDto,
    @CurrentUser() user: PublicUser
  ) {
    return this.patientsProfilesService.update(user.id, body);
  }

  @RoleProtected(ValidRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un perfil de paciente' })
  @ApiResponse({ status: 204, description: 'Perfil eliminado correctamente' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientsProfilesService.remove(id);
  }
}
