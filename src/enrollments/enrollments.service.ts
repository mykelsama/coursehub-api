import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto.js';
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

  async findAll(query: EnrollmentsQueryDto) {
    const qb = this.enrollmentsRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.course', 'course');

    if (query.search) {
      qb.andWhere('(student.name ILIKE :search OR course.title ILIKE :search)', {
        search: `%${query.search.trim()}%`,
      });
    }

    if (query.studentId) {
      qb.andWhere('student.id = :studentId', { studentId: query.studentId });
    }

    if (query.courseId) {
      qb.andWhere('course.id = :courseId', { courseId: query.courseId });
    }

    if (query.activeOnly === 'true') {
      qb.andWhere('student.isActive = :active', { active: true });
    }

    qb.orderBy('enrollment.id', 'ASC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findByStudent(studentId: number): Promise<Enrollment[]> {
    await this.studentsService.findOne(studentId);
    return this.enrollmentsRepository.find({
      where: { student: { id: studentId } },
      order: { id: 'ASC' },
    });
  }

  async findByCourse(courseId: number): Promise<Enrollment[]> {
    await this.coursesService.findOne(courseId);
    return this.enrollmentsRepository.find({
      where: { course: { id: courseId } },
      order: { id: 'ASC' },
    });
  }

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const { studentId, courseId } = createEnrollmentDto;

    const student = await this.studentsService.findOne(studentId);
    const course = await this.coursesService.findOne(courseId);

    if (!student.isActive) {
      throw new BadRequestException('El estudiante no se encuentra activo');
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
      throw new NotFoundException(`Matrícula con id ${id} no encontrada`);
    }
    await this.enrollmentsRepository.remove(enrollment);
    return enrollment;
  }
}