import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-students.dto.js';

export class UpdateStudentDto extends PartialType(
  OmitType(CreateStudentDto, [] as const),
) {}