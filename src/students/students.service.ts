import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity.js';
import { CreateStudentDto } from './dto/create-students.dto.js';
import { UpdateStudentDto } from './dto/update-students.dto.js';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  findAll(career?: string, semester?: number, isActive?: boolean): Promise<Student[]> {
    const where: Record<string, unknown> = {};
    if (career) where.career = career;
    if (semester !== undefined) where.semester = semester;
    if (isActive !== undefined) where.isActive = isActive;

    return this.studentsRepository.find({ where });
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentsRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException(`Estudiante con id ${id} no encontrado`);
    }
    return student;
  }

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const emailExists = await this.studentsRepository.findOne({
      where: { email: createStudentDto.email },
    });
    if (emailExists) {
      throw new ConflictException('Ya existe un estudiante con ese correo');
    }

    const student = this.studentsRepository.create({
      ...createStudentDto,
      isActive: true,
    });
    return this.studentsRepository.save(student);
  }

  async update(id: number, input: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);

    if (input.email && input.email !== student.email) {
      const emailExists = await this.studentsRepository.findOne({
        where: { email: input.email },
      });
      if (emailExists) {
        throw new ConflictException('Ya existe un estudiante con ese correo');
      }
    }

    Object.assign(student, input);
    return this.studentsRepository.save(student);
  }

  async updateStatus(id: number, isActive: boolean): Promise<Student> {
    const student = await this.findOne(id);
    student.isActive = isActive;
    return this.studentsRepository.save(student);
  }

  async remove(id: number): Promise<Student> {
    const student = await this.findOne(id);

    if (!student.isActive) {
      throw new ConflictException('No se puede eliminar un estudiante inactivo');
    }

    await this.studentsRepository.remove(student);
    return student;
  }
}