import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StudentsService } from './students.service.js';
import { CreateStudentDto } from './dto/create-students.dto.js';
import { UpdateStudentDto } from './dto/update-students.dto.js';
import { UpdateStatusDto } from './dto/update-status.dto.js';
import { ParseIntPipe } from '@nestjs/common';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(
    @Query('career') career?: string,
    @Query('semester') semester?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.studentsService.findAll(
      career,
      semester !== undefined ? Number(semester) : undefined,
      isActive !== undefined ? isActive === 'true' : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.findOne(id);
  }

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.studentsService.updateStatus(id, updateStatusDto.isActive);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.studentsService.remove(id);
  }
}