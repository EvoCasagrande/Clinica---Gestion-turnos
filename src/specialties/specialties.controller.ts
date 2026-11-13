import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { SpecialtiesService } from './specialties.service.js';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSpecialtyDto } from './dto/create-specialty.dto.js';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RoleProtected } from '../auth/decorators/roles.decorator.js';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface.js';

@Controller('specialties')
@ApiTags('specialties')
export class SpecialtiesController {
    constructor(private readonly specialtiesService: SpecialtiesService) {}

    @Get()
    @ApiOperation({ summary: 'Listar especialidades' })
    @ApiResponse({ status: 200, description: 'Especialidades disponibles' })
    findAll() {
        return this.specialtiesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consultar una especialidad' })
    @ApiResponse({ status: 200, description: 'Especialidad encontrada' })
    @ApiResponse({ status: 404, description: 'Especialidad no encontrada' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.specialtiesService.findOne(id);
    }

    @RoleProtected(ValidRoles.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear una especialidad' })
    @ApiResponse({ status: 201, description: 'Especialidad creada correctamente' })
    create(@Body() body: CreateSpecialtyDto) {
        return this.specialtiesService.create(body);
    }

    @RoleProtected(ValidRoles.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Modificar una especialidad' })
    @ApiResponse({ status: 200, description: 'Especialidad actualizada correctamente' })
    update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateSpecialtyDto) {
        return this.specialtiesService.update(id, body);
    }

    @RoleProtected(ValidRoles.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar una especialidad' })
    @ApiResponse({ status: 204, description: 'Especialidad eliminada correctamente' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.specialtiesService.delete(id);
    }
}
