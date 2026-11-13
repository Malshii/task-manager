import { TransformFnParams } from 'class-transformer';

// For @Transform: trims strings and leaves any other value for the validators to reject.
export const trimString = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;
