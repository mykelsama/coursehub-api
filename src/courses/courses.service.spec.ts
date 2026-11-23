import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoursesService } from './courses.service.js';
import { Course } from './entities/course.entity.js';
import type { Enrollment } from '../enrollments/entities/enrollment.entity.js';

describe('CoursesService', () => {
  const coursesRepository = {
    findOne: vi.fn(),
    remove: vi.fn(),
  };
  let service: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getRepositoryToken(Course), useValue: coursesRepository },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    vi.clearAllMocks();
  });

  describe('remove', () => {
    it('removes a course that has no enrollments', async () => {
      const course = { id: 7, enrollments: [] as Enrollment[] } as Course;
      coursesRepository.findOne.mockResolvedValue(course);

      await expect(service.remove(7)).resolves.toBe(course);
      expect(coursesRepository.remove).toHaveBeenCalledWith(course);
    });

    it('rejects removing a course that has enrollments with 409 and keeps it', async () => {
      coursesRepository.findOne.mockResolvedValue({
        id: 7,
        enrollments: [{ id: 1 } as Enrollment],
      } as Course);

      await expect(service.remove(7)).rejects.toThrow(ConflictException);
      expect(coursesRepository.remove).not.toHaveBeenCalled();
    });

    it('rejects removing a course that does not exist with 404', async () => {
      coursesRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(coursesRepository.remove).not.toHaveBeenCalled();
    });
  });
});
