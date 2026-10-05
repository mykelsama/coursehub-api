import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsController } from './students.controller.js';
import { StudentsService } from './students.service.js';
import { Student } from './entities/student.entity.js';
import { EnrollmentsModule } from '../enrollments/enrollments.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    forwardRef(() => EnrollmentsModule),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}