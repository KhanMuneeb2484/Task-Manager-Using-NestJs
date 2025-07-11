// src/tasks/dto/create-task.dto.ts
import { IsNotEmpty, IsOptional, IsIn, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'title should not be empty' })
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['pending', 'completed'], {
    message: 'status must be either pending or completed',
  })
  status?: string;
}
