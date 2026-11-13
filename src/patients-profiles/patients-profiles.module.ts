import { Module } from '@nestjs/common';
import { PatientsProfilesService } from './patients-profiles.service.js';
import { PatientsProfilesController } from './patients-profiles.controller.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Module({
  controllers: [PatientsProfilesController],
  providers: [PatientsProfilesService, JwtAuthGuard, RolesGuard],
})
export class PatientsProfilesModule {}
