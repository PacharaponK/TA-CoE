import {
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class EnqueueDto {
  @IsMongoId()
  subjectId: string;

  @IsMongoId()
  labId: string;

  @IsOptional()
  @IsString()
  checkpointId?: string | null; // null/omitted when the lab has no checkpoints

  @IsString()
  @MaxLength(50)
  studentId: string;

  @IsString()
  @MaxLength(200)
  studentName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  section?: string;
}

export class ResolveDto {
  @IsIn(['passed', 'failed'])
  result: 'passed' | 'failed';
}
