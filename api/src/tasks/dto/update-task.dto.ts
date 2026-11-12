import { PartialType, PickType } from '@nestjs/mapped-types';
import {
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

// PartialType would add @IsOptional() to every field, which also skips
// validation for null. So only `status` is inherited from it; the other
// fields are declared explicitly with their own rules.
export class UpdateTaskDto extends PartialType(
  PickType(CreateTaskDto, ['status'] as const),
) {
  // May be omitted, but if sent it must be a valid title (null/"" -> 400).
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  // null explicitly clears the value.
  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsISO8601()
  dueDate?: string | null;
}
