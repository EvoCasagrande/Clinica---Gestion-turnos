import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service.js';
import { AppointmentsController } from './appointments.controller.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService, JwtAuthGuard, RolesGuard],
})
export class AppointmentsModule {}
