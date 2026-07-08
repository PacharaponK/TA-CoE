import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

/** One subject + the student's section in that subject. */
export class EnrollmentDto {
  @IsMongoId()
  subjectId: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  section?: string;
}

export class CreateStudentDto {
  @IsString()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @MaxLength(100)
  surname: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickname?: string;

  @IsString()
  @MaxLength(50)
  studentId: string;

  @IsInt()
  @Min(1)
  @Max(6)
  year: number;

  @ValidateIf((o) => !!o.email)
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  /** Subjects this student is enrolled in, each with its own section. */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnrollmentDto)
  enrollments?: EnrollmentDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  surname?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickname?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  year?: number;

  @ValidateIf((o) => !!o.email)
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnrollmentDto)
  enrollments?: EnrollmentDto[];
}

/** Body for bulk delete: `{ ids: [...] }`. */
export class BulkIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  ids: string[];
}

/** Body for bulk update: activate/deactivate and/or enroll/unenroll a subject across many students at once. */
export class BulkUpdateDto extends BulkIdsDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsMongoId()
  addSubjectId?: string;

  @IsOptional()
  @IsMongoId()
  removeSubjectId?: string;
}

/** Body for CSV import: rows already resolved (subject codes → ids) client-side. */
export class ImportStudentsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStudentDto)
  students: CreateStudentDto[];
}
