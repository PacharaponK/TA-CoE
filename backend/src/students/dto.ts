import {
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
} from 'class-validator';

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

  @IsOptional()
  @IsString()
  @MaxLength(50)
  section?: string;

  @ValidateIf((o) => !!o.email)
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  /** Subjects this student is enrolled in. */
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  subjectIds?: string[];
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

  @IsOptional()
  @IsString()
  @MaxLength(50)
  section?: string;

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
  @IsMongoId({ each: true })
  subjectIds?: string[];
}
