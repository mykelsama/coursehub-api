import { Module, forwardRef } from '@nestjs/common';
import { EnrollmentsController } from './enrollments.controller.js';
import { EnrollmentsService } from './enrollments.service.js';
import { CoursesModule } from '../courses/courses.module.js';
import { StudentsModule } from '../students/students.module.js';

@Module({
  imports: [
    forwardRef(() => CoursesModule),
    forwardRef(() => StudentsModule),
  ],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}