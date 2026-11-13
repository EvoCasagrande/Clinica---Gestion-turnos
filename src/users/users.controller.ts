import {  Controller, ParseUUIDPipe,Delete, Get, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { RoleProtected } from '../auth/decorators/roles.decorator.js';
import { ValidRoles } from '../auth/interfaces/valid-roles.interface.js';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
@RoleProtected(ValidRoles.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @Get()
    @ApiOperation({ summary: 'Listar usuarios' })
    @ApiResponse({ status: 200, description: 'Usuarios públicos encontrados' })
    async getAllUsers() {
        return await this.userService.getAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Consultar un usuario' })
    @ApiResponse({ status: 200, description: 'Usuario encontrado' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async getUserById(@Param('id', ParseUUIDPipe) id: string) {
        return await this.userService.getById(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar un usuario' })
    @ApiResponse({ status: 204, description: 'Usuario eliminado correctamente' })
    async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
        return await this.userService.delete(id);
    }
}
