import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { EnrollmentsService } from '../enrollments/enrollments.service.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';


@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    @Inject(forwardRef(() => EnrollmentsService))
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @Get(':id/enrollments')
  findEnrollments(@Param('id') id: string) {
    return this.enrollmentsService.findByCourse(Number(id));
  }

  @Get()
  findAll(@Query('level') level?: string) {
    return this.coursesService.findAll(level);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(Number(id));
  }

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(Number(id), updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(Number(id));
  }
}