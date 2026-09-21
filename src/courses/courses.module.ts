import { Module, forwardRef } from '@nestjs/common';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { EnrollmentsModule } from '../enrollments/enrollments.module.js';

@Module({
  imports: [forwardRef(() => EnrollmentsModule)],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}