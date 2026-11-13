import { Module } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Module({
    providers: [UsersService, JwtAuthGuard, RolesGuard],
    controllers: [UsersController],
    exports: [UsersService]
})
export class UsersModule {}
