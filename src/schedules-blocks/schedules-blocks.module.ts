import { Module } from '@nestjs/common';
import { SchedulesBlocksService } from './schedules-blocks.service.js';
import { SchedulesBlocksController } from './schedules-blocks.controller.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

@Module({
  controllers: [SchedulesBlocksController],
  providers: [SchedulesBlocksService, JwtAuthGuard, RolesGuard],
})
export class SchedulesBlocksModule {}
