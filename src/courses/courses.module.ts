import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import { Course } from './entities/course.entity.js';
import { EnrollmentsModule } from '../enrollments/enrollments.module.js';
import { COURSE_REPOSITORY } from './repositories/course.repository.js';
import { TypeOrmCourseRepository } from './repositories/typeorm-course.repository.js';
import { UpdateCourseUseCase } from './use-cases/update-course.use-case.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    AuthModule,
    forwardRef(() => EnrollmentsModule),
  ],
  controllers: [CoursesController],
  providers: [
    CoursesService,
    UpdateCourseUseCase,
    { provide: COURSE_REPOSITORY, useClass: TypeOrmCourseRepository },
  ],
  exports: [CoursesService],
})
export class CoursesModule {}