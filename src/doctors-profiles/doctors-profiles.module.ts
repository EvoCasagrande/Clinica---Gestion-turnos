import { Module } from '@nestjs/common';
import { DoctorsProfilesService } from './doctors-profiles.service.js';
import { DoctorsProfilesController } from './doctors-profiles.controller.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Module({
  controllers: [DoctorsProfilesController],
  providers: [DoctorsProfilesService, JwtAuthGuard, RolesGuard],
})
export class DoctorsProfilesModule {}
