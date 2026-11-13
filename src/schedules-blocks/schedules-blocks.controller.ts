import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { SchedulesBlocksService } from './schedules-blocks.service.js';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSchedulesBlockDto } from './dto/create-schedules-block.dto.js';
import { UpdateSchedulesBlockDto } from './dto/update-schedules-block.dto.js';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface.js';
import { RoleProtected } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { PublicUser } from '../users/types/public-user.js';

@Controller('schedules-blocks')
@ApiTags('schedules-blocks')
@ApiBearerAuth()
export class SchedulesBlocksController {
  constructor(private readonly schedulesBlocksService: SchedulesBlocksService) {}

  @Get()
  @ApiOperation({ summary: 'Listar bloques de disponibilidad' })
  @ApiResponse({ status: 200, description: 'Bloques ordenados por fecha de inicio' })
  findAll() {
    return this.schedulesBlocksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar un bloque de disponibilidad' })
  @ApiResponse({ status: 200, description: 'Bloque encontrado' })
  @ApiResponse({ status: 404, description: 'Bloque no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.schedulesBlocksService.findOne(id);
  }

  @RoleProtected(ValidRoles.ADMIN, ValidRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @ApiOperation({ summary: 'Crear disponibilidad médica' })
  @ApiResponse({ status: 201, description: 'Disponibilidad creada correctamente' })
  @ApiResponse({ status: 409, description: 'El horario se superpone con otra disponibilidad' })
  create(
    @Body() body: CreateSchedulesBlockDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.schedulesBlocksService.create(user, body);
  }

  @RoleProtected(ValidRoles.ADMIN, ValidRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Modificar disponibilidad médica' })
  @ApiResponse({ status: 200, description: 'Disponibilidad actualizada correctamente' })
  @ApiResponse({ status: 409, description: 'El nuevo horario se superpone con otro' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateSchedulesBlockDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.schedulesBlocksService.update(user, id, body);
  }

  @RoleProtected(ValidRoles.ADMIN, ValidRoles.DOCTOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar disponibilidad médica' })
  @ApiResponse({ status: 204, description: 'Disponibilidad eliminada correctamente' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: PublicUser,
  ) {
    return this.schedulesBlocksService.remove(user, id);
  }
}
