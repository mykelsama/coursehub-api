import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { CoursesService } from './courses.service.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { CoursesQueryDto } from './dto/courses-query.dto.js';
import { EnrollmentsService } from '../enrollments/enrollments.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { UserRole } from '../users/user-role.enum.js';
import { ParseIntPipe } from '../students/pipes/parse-int.pipe.js';
import type { AuthenticatedUser } from '../auth/types/jwt-payload.type.js';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    @Inject(forwardRef(() => EnrollmentsService))
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  @Get(':id/enrollments')
  findEnrollments(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.findByCourse(id);
  }

  @Get()
  findAll(@Query() query: CoursesQueryDto) {
    return this.coursesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.coursesService.create(createCourseDto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.coursesService.update(id, updateCourseDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}