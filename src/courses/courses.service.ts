import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm';
import { Course } from './entities/course.entity.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { CoursesQueryDto } from './dto/courses-query.dto.js';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
  ) {}

  async findAll(query: CoursesQueryDto) {
    const { level, title, page, limit, sortBy, order } = query;

    const where: FindOptionsWhere<Course> = {};
    if (level) where.level = level;
    if (title) where.title = title;

    const [items, total] = await this.coursesRepository.findAndCount({
      where,
      order: { [sortBy]: order } as FindOptionsOrder<Course>,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.coursesRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Curso con id ${id} no encontrado`);
    }
    return course;
  }

  create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.coursesRepository.create(createCourseDto);
    return this.coursesRepository.save(course);
  }

  async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    Object.assign(course, updateCourseDto);
    return this.coursesRepository.save(course);
  }

  async remove(id: number): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: { enrollments: true },
    });
    if (!course) {
      throw new NotFoundException(`Curso con id ${id} no encontrado`);
    }

    if (course.enrollments.length > 0) {
      throw new ConflictException(
        'No se puede eliminar un curso que tiene matrículas',
      );
    }

    await this.coursesRepository.remove(course);
    return course;
  }
}