import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-students.dto.js';

type Student = {
  id: number;
  name: string;
  email: string;
  age: number;
  career: string;
  semester: number;
  isActive: boolean;
};

type UpdateStudentInput = {
  name?: string;
  email?: string;
  age?: number;
  career?: string;
  semester?: number;
};

@Injectable()
export class StudentsService {
  private nextId = 1;

  private readonly students: Student[] = [];

  findAll(career?: string, semester?: number, isActive?: boolean): Student[] {
    return this.students.filter((student) => {
      if (career && student.career !== career) return false;
      if (semester !== undefined && student.semester !== semester) return false;
      if (isActive !== undefined && student.isActive !== isActive) return false;
      return true;
    });
  }

  findOne(id: number): Student {
    const student = this.students.find((s) => s.id === id);
    if (!student) {
      throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
    }
    return student;
  }

  create(createStudentDto: CreateStudentDto): Student {
    const emailExists = this.students.some(
      (s) => s.email === createStudentDto.email,
    );
    if (emailExists) {
      throw new ConflictException('Ya existe un estudiante con ese correo');
    }

    const student: Student = {
      id: this.nextId++,
      ...createStudentDto,
      isActive: true,
    };
    this.students.push(student);
    return student;
  }

  update(id: number, input: UpdateStudentInput): Student {
    const student = this.findOne(id);

    if (input.email && input.email !== student.email) {
      const emailExists = this.students.some((s) => s.email === input.email);
      if (emailExists) {
        throw new ConflictException('Ya existe un estudiante con ese correo');
      }
    }

    Object.assign(student, input);
    return student;
  }

  updateStatus(id: number, isActive: boolean): Student {
    const student = this.findOne(id);
    student.isActive = isActive;
    return student;
  }

  remove(id: number): Student {
    const student = this.findOne(id);

    if (!student.isActive) {
      throw new ConflictException('No se puede eliminar un estudiante inactivo');
    }

    const index = this.students.findIndex((s) => s.id === id);
    this.students.splice(index, 1);
    return student;
  }
}