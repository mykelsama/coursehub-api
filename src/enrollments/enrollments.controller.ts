import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service.js';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { EnrollmentsQueryDto } from './dto/enrollments-query.dto.js';
import { ParseIntPipe } from '../students/pipes/parse-int.pipe.js';

@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  findAll(@Query() query: EnrollmentsQueryDto) {
    return this.enrollmentsService.findAll(query);
  }

  @Post()
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.enrollmentsService.remove(id);
  }
}