import { Module } from '@nestjs/common';
import { DoctorsSpecialtiesService } from './doctors-specialties.service.js';
import { DoctorsSpecialtiesController } from './doctors-specialties.controller.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Module({
  controllers: [DoctorsSpecialtiesController],
  providers: [DoctorsSpecialtiesService, JwtAuthGuard, RolesGuard],
})
export class DoctorsSpecialtiesModule {}
