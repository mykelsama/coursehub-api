import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { StudentsService } from '../students/students.service.js';
import { CoursesService } from '../courses/courses.service.js';

type Enrollment = {
  id: number;
  studentId: number;
  courseId: number;
};

@Injectable()
export class EnrollmentsService {
  private nextId = 1;
  private readonly enrollments: Enrollment[] = [];

  constructor(
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
  ) {}

  findAll(studentId?: number, courseId?: number): Enrollment[] {
    return this.enrollments.filter((enrollment) => {
      if (studentId !== undefined && enrollment.studentId !== studentId) return false;
      if (courseId !== undefined && enrollment.courseId !== courseId) return false;
      return true;
    });
  }

  findByStudent(studentId: number): Enrollment[] {
    this.studentsService.findOne(studentId);
    return this.enrollments.filter((e) => e.studentId === studentId);
  }

  findByCourse(courseId: number): Enrollment[] {
    this.coursesService.findOne(courseId);
    return this.enrollments.filter((e) => e.courseId === courseId);
  }

  create(createEnrollmentDto: CreateEnrollmentDto): Enrollment {
    const { studentId, courseId } = createEnrollmentDto;

    const student = this.studentsService.findOne(studentId);
    this.coursesService.findOne(courseId);

    if (!student.isActive) {
      throw new ConflictException('El estudiante no se encuentra activo');
    }

    const alreadyEnrolled = this.enrollments.some(
      (e) => e.studentId === studentId && e.courseId === courseId,
    );
    if (alreadyEnrolled) {
      throw new ConflictException('El estudiante ya está matriculado en este curso');
    }

    const enrollment: Enrollment = {
      id: this.nextId++,
      studentId,
      courseId,
    };
    this.enrollments.push(enrollment);
    return enrollment;
  }

  remove(id: number): Enrollment {
    const index = this.enrollments.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new NotFoundException(`Matrícula con id ${id} no encontrada`);
    }
    const [removed] = this.enrollments.splice(index, 1);
    return removed;
  }
}