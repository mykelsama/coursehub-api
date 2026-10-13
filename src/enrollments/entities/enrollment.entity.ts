import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Student } from '../../students/entities/student.entity.js';
import { Course } from '../../courses/entities/course.entity.js';

@Entity('enrollments')
@Unique(['student', 'course'])
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.enrollments, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  student: Relation<Student>;

  @ManyToOne(() => Course, (course) => course.enrollments, {
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  course: Relation<Course>;
}