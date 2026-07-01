import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CheckpointDto {
  @IsOptional()
  @IsString()
  _id?: string; // present when editing an existing checkpoint

  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

export class CreateLabDto {
  @IsMongoId()
  subjectId: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckpointDto)
  checkpoints?: CheckpointDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SetLabPauseDto {
  @IsBoolean()
  queuePaused: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  pausedMessage?: string;
}

export class UpdateLabDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckpointDto)
  checkpoints?: CheckpointDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
