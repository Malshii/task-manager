import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { TaskStatus } from '../task-status.enum';
import { trimString } from './trim-string';

// Not built with PartialType: it adds @IsOptional() to every field, which also
// skips validation for null. Fields are declared explicitly instead.
export class UpdateTaskDto {
  // title and status may be omitted, but if sent they must be valid (null -> 400).
  @Transform(trimString)
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  // null explicitly clears the value.
  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsISO8601()
  dueDate?: string | null;
}
