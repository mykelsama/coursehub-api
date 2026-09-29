import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { Course } from './entities/course.entity.js';
import { EnrollmentsModule } from '../enrollments/enrollments.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    forwardRef(() => EnrollmentsModule),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}