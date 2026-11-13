import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientsProfileDto } from './create-patients-profile.dto.js';

export class UpdatePatientsProfileDto extends PartialType(CreatePatientsProfileDto) {}
