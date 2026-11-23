import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserRole } from '../../users/user-role.enum.js';
import type { AuthenticatedUser } from '../../auth/types/jwt-payload.type.js';
import type { Course } from '../entities/course.entity.js';
import { COURSE_REPOSITORY } from '../repositories/course.repository.js';
import { UpdateCourseUseCase } from './update-course.use-case.js';

describe('UpdateCourseUseCase', () => {
  const courses = {
    findById: vi.fn(),
    save: vi.fn(),
  };
  let useCase: UpdateCourseUseCase;

  const owner: AuthenticatedUser = {
    id: 4,
    email: 'owner@coursehub.test',
    role: UserRole.TEACHER,
  };
  const otherTeacher: AuthenticatedUser = {
    id: 9,
    email: 'other@coursehub.test',
    role: UserRole.TEACHER,
  };
  const admin: AuthenticatedUser = {
    id: 1,
    email: 'admin@coursehub.test',
    role: UserRole.ADMIN,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UpdateCourseUseCase,
        { provide: COURSE_REPOSITORY, useValue: courses },
      ],
    }).compile();

    useCase = module.get(UpdateCourseUseCase);
    vi.clearAllMocks();
  });

  it('allows the owner teacher to update a course', async () => {
    const course = { id: 7, title: 'NestJS', createdByUserId: 4 } as Course;
    courses.findById.mockResolvedValue(course);
    courses.save.mockImplementation(async (value: Course) => value);

    const result = await useCase.execute(
      7,
      { title: 'NestJS avanzado' },
      owner,
    );

    expect(result.title).toBe('NestJS avanzado');
    expect(courses.findById).toHaveBeenCalledWith(7);
    expect(courses.save).toHaveBeenCalledWith(course);
  });

  it('allows an admin to update a course created by someone else', async () => {
    const course = { id: 7, title: 'NestJS', createdByUserId: 4 } as Course;
    courses.findById.mockResolvedValue(course);
    courses.save.mockImplementation(async (value: Course) => value);

    const result = await useCase.execute(7, { level: 'advanced' }, admin);

    expect(result.level).toBe('advanced');
    expect(courses.save).toHaveBeenCalledWith(course);
  });

  it('rejects an update of a course that does not exist with 404', async () => {
    courses.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(99, { title: 'Cambio' }, owner),
    ).rejects.toThrow(NotFoundException);
    expect(courses.save).not.toHaveBeenCalled();
  });

  it('rejects an update from a different teacher', async () => {
    courses.findById.mockResolvedValue({ id: 7, createdByUserId: 4 } as Course);

    await expect(
      useCase.execute(7, { title: 'Cambio' }, otherTeacher),
    ).rejects.toThrow(ForbiddenException);
    expect(courses.save).not.toHaveBeenCalled();
  });

  it('rejects a teacher when the course has no owner', async () => {
    courses.findById.mockResolvedValue({
      id: 7,
      createdByUserId: null,
    } as Course);

    await expect(
      useCase.execute(7, { title: 'Cambio' }, owner),
    ).rejects.toThrow(ForbiddenException);
    expect(courses.save).not.toHaveBeenCalled();
  });
});
