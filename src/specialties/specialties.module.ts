import { Module } from '@nestjs/common';
import { SpecialtiesService } from './specialties.service.js';
import { SpecialtiesController } from './specialties.controller.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Module({
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService, JwtAuthGuard, RolesGuard],
})
export class SpecialtiesModule {}
