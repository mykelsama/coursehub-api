import { Module, forwardRef } from '@nestjs/common';
import { StudentsController } from './students.controller.js';
import { StudentsService } from './students.service.js';
import { EnrollmentsModule } from '../enrollments/enrollments.module.js';

@Module({
  imports: [forwardRef(() => EnrollmentsModule)],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}