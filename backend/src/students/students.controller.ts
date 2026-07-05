import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import {
  BulkIdsDto,
  BulkUpdateDto,
  CreateStudentDto,
  ImportStudentsDto,
  UpdateStudentDto,
} from './dto';
import { AdminGuard } from '../common/admin.guard';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(
    @Query('activeOnly') activeOnly?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.studentsService.findAll(activeOnly === 'true', subjectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Get('by-student-id/:studentId')
  findByStudentId(@Param('studentId') studentId: string) {
    return this.studentsService.findByStudentId(studentId);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Post('import')
  @UseGuards(AdminGuard)
  import(@Body() dto: ImportStudentsDto) {
    return this.studentsService.importMany(dto.students);
  }

  @Patch('bulk')
  @UseGuards(AdminGuard)
  bulkUpdate(@Body() dto: BulkUpdateDto) {
    return this.studentsService.bulkUpdate(dto);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Delete('bulk')
  @UseGuards(AdminGuard)
  removeMany(@Body() dto: BulkIdsDto) {
    return this.studentsService.removeMany(dto.ids);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
