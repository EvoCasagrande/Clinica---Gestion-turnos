import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { DoctorsProfilesService } from './doctors-profiles.service.js';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateDoctorsProfileDto } from './dto/create-doctors-profile.dto.js';
import { UpdateDoctorsProfileDto } from './dto/update-doctors-profile.dto.js';
import { RoleProtected } from '../auth/decorators/roles.decorator.js';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Controller('doctors-profiles')
@ApiTags('doctors-profiles')
export class DoctorsProfilesController {
  constructor(private readonly doctorsProfilesService: DoctorsProfilesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar perfiles médicos' })
  @ApiResponse({ status: 200, description: 'Perfiles médicos encontrados' })
  findAll() {
    return this.doctorsProfilesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un perfil médico' })
  @ApiResponse({ status: 200, description: 'Perfil médico encontrado' })
  @ApiResponse({ status: 404, description: 'Perfil médico no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.doctorsProfilesService.findOne(id);
  }

  @RoleProtected(ValidRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un perfil médico' })
  @ApiResponse({ status: 201, description: 'Perfil médico creado correctamente' })
  create(@Body() createDoctorsProfileDto: CreateDoctorsProfileDto) {
    return this.doctorsProfilesService.create(createDoctorsProfileDto);
  }

  @RoleProtected(ValidRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modificar un perfil médico' })
  @ApiResponse({ status: 200, description: 'Perfil médico actualizado correctamente' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateDoctorsProfileDto: UpdateDoctorsProfileDto) {
    return this.doctorsProfilesService.update(id, updateDoctorsProfileDto);
  }

  @RoleProtected(ValidRoles.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un perfil médico' })
  @ApiResponse({ status: 204, description: 'Perfil médico eliminado correctamente' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.doctorsProfilesService.remove(id);
  }
}
