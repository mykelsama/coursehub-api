import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto.js';

type Course = {
  id: number;
  title: string;
  level: string;
};

type UpdateCourseInput = {
  title?: string;
  level?: string;
};

@Injectable()
export class CoursesService {
  private nextId = 4;

  private readonly courses: Course[] = [
    { id: 1, title: 'NestJS Fundamentals', level: 'beginner' },
    { id: 2, title: 'REST APIs with NestJS', level: 'beginner' },
    { id: 3, title: 'NestJS Architecture', level: 'intermediate' },
  ];

  findAll(level?: string): Course[] {
    if (!level) {
      return this.courses;
    }
    return this.courses.filter((course) => course.level === level);
  }

  findOne(id: number): Course {
    const course = this.courses.find((c) => c.id === id);
    if (!course) {
      throw new NotFoundException(`Curso con id ${id} no encontrado`);
    }
    return course;
  }

  create(createCourseDto: CreateCourseDto): Course {
    const course = { id: this.nextId++, ...createCourseDto };
    this.courses.push(course);
    return course;
  }

  update(id: number, input: UpdateCourseInput): Course {
    const course = this.findOne(id);
    Object.assign(course, input);
    return course;
  }

  remove(id: number): Course {
    const course = this.findOne(id);
    const index = this.courses.findIndex((c) => c.id === id);
    this.courses.splice(index, 1);
    return course;
  }
}