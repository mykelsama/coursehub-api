import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../../users/user-role.enum.js';
import type { AuthenticatedUser } from '../../auth/types/jwt-payload.type.js';
import type { Course } from '../entities/course.entity.js';
import type { UpdateCourseDto } from '../dto/update-course.dto.js';
import {
  COURSE_REPOSITORY,
  type CourseRepository,
} from '../repositories/course.repository.js';

@Injectable()
export class UpdateCourseUseCase {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courses: CourseRepository,
  ) {}

  async execute(
    id: number,
    changes: UpdateCourseDto,
    actor: AuthenticatedUser,
  ): Promise<Course> {
    const course = await this.courses.findById(id);
    if (!course) {
      throw new NotFoundException(`Curso con id ${id} no encontrado`);
    }

    const isAdmin = actor.role === UserRole.ADMIN;
    const isOwner = course.createdByUserId === actor.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('No puedes modificar este curso');
    }

    Object.assign(course, changes);
    return this.courses.save(course);
  }
}
