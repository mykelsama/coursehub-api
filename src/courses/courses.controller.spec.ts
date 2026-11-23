import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRole } from '../users/user-role.enum.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';
import { EnrollmentsService } from '../enrollments/enrollments.service.js';
import { CoursesController } from './courses.controller.js';
import { CoursesService } from './courses.service.js';
import type { UpdateCourseDto } from './dto/update-course.dto.js';
import { UpdateCourseUseCase } from './use-cases/update-course.use-case.js';

describe('CoursesController', () => {
  const updateCourse = { execute: vi.fn() };
  let controller: CoursesController;

  const actor: AuthenticatedUser = {
    id: 4,
    email: 'teacher@coursehub.test',
    role: UserRole.TEACHER,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        { provide: UpdateCourseUseCase, useValue: updateCourse },
        { provide: CoursesService, useValue: {} },
        { provide: EnrollmentsService, useValue: {} },
      ],
    }).compile();

    controller = module.get(CoursesController);
    vi.clearAllMocks();
  });

  it('delegates update with the id, body and authenticated user', async () => {
    const dto: UpdateCourseDto = { title: 'NestJS avanzado' };
    updateCourse.execute.mockResolvedValue({ id: 7, ...dto });

    await expect(controller.update(7, dto, actor)).resolves.toEqual({
      id: 7,
      ...dto,
    });
    expect(updateCourse.execute).toHaveBeenCalledWith(7, dto, actor);
    expect(updateCourse.execute).toHaveBeenCalledTimes(1);
  });

  it('propagates a forbidden error from the use case instead of returning a result', async () => {
    updateCourse.execute.mockRejectedValue(
      new ForbiddenException('No puedes modificar este curso'),
    );

    await expect(
      controller.update(7, { title: 'Cambio' }, actor),
    ).rejects.toThrow(ForbiddenException);
  });

  it('propagates a not found error from the use case', async () => {
    updateCourse.execute.mockRejectedValue(
      new NotFoundException('Curso con id 99 no encontrado'),
    );

    await expect(
      controller.update(99, { title: 'Cambio' }, actor),
    ).rejects.toThrow(NotFoundException);
  });
});
