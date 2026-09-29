import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity.js';
import { CreateCourseDto } from './dto/create-course.dto.js';

type UpdateCourseInput = {
  title?: string;
  level?: string;
};

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
  ) {}

  findAll(level?: string): Promise<Course[]> {
    if (!level) {
      return this.coursesRepository.find();
    }
    return this.coursesRepository.find({ where: { level } });
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

  async update(id: number, input: UpdateCourseInput): Promise<Course> {
    const course = await this.findOne(id);
    Object.assign(course, input);
    return this.coursesRepository.save(course);
  }

  async remove(id: number): Promise<Course> {
    const course = await this.findOne(id);
    await this.coursesRepository.remove(course);
    return course;
  }
}