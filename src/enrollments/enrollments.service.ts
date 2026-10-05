import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { StudentsService } from '../students/students.service.js';
import { CoursesService } from '../courses/courses.service.js';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentsRepository: Repository<Enrollment>,
    private readonly studentsService: StudentsService,
    private readonly coursesService: CoursesService,
  ) {}

  findAll(studentId?: number, courseId?: number): Promise<Enrollment[]> {
    const where: Record<string, unknown> = {};
    if (studentId !== undefined) where.student = { id: studentId };
    if (courseId !== undefined) where.course = { id: courseId };

    return this.enrollmentsRepository.find({ where });
  }

  async findByStudent(studentId: number): Promise<Enrollment[]> {
    await this.studentsService.findOne(studentId);
    return this.enrollmentsRepository.find({
      where: { student: { id: studentId } },
    });
  }

  async findByCourse(courseId: number): Promise<Enrollment[]> {
    await this.coursesService.findOne(courseId);
    return this.enrollmentsRepository.find({
      where: { course: { id: courseId } },
    });
  }

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const { studentId, courseId } = createEnrollmentDto;

    const student = await this.studentsService.findOne(studentId);
    const course = await this.coursesService.findOne(courseId);

    if (!student.isActive) {
      throw new ConflictException('El estudiante no se encuentra activo');
    }

    const alreadyEnrolled = await this.enrollmentsRepository.findOne({
      where: { student: { id: studentId }, course: { id: courseId } },
    });
    if (alreadyEnrolled) {
      throw new ConflictException('El estudiante ya está matriculado en este curso');
    }

    const enrollment = this.enrollmentsRepository.create({ student, course });
    return this.enrollmentsRepository.save(enrollment);
  }

  async remove(id: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentsRepository.findOne({ where: { id } });
    if (!enrollment) {
      throw new ConflictException(`Matrícula con id ${id} no encontrada`);
    }
    await this.enrollmentsRepository.remove(enrollment);
    return enrollment;
  }
}