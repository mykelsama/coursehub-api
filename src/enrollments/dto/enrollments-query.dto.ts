import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class EnrollmentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  studentId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  courseId?: number;
}