import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AppointmentsModule } from './appointments/appointments.module.js';
import { SpecialtiesModule } from './specialties/specialties.module.js';
import { PatientsProfilesModule } from './patients-profiles/patients-profiles.module.js';
import { DoctorsProfilesModule } from './doctors-profiles/doctors-profiles.module.js';
import { DoctorsSpecialtiesModule } from './doctors-specialties/doctors-specialties.module.js';
import { SchedulesBlocksModule } from './schedules-blocks/schedules-blocks.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, UsersModule, AppointmentsModule, SpecialtiesModule, PatientsProfilesModule, DoctorsProfilesModule, DoctorsSpecialtiesModule, SchedulesBlocksModule, AuthModule],
})
export class AppModule {}
