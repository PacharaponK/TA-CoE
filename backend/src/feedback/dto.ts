import { IsIn, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFeedbackDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  studentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  studentName?: string;

  @IsOptional()
  @IsMongoId()
  subjectId?: string;

  @IsString()
  @MaxLength(2000)
  message: string;
}

export class UpdateFeedbackStatusDto {
  @IsIn(['new', 'read'])
  status: 'new' | 'read';
}
