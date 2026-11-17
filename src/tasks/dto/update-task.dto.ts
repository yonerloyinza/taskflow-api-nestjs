import { IsString, IsOptional, IsEnum, IsDateString, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../enums/task-status.enum.js';
import { TaskPriority } from '../enums/task-priority.enum.js';

export class UpdateTaskDto {
  @ApiPropertyOptional({ minLength: 3, maxLength: 100, example: 'Comprar leche' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ maxLength: 500, example: 'Leche entera 1L' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ maxLength: 100, example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  assignee?: string;

  @ApiPropertyOptional({ format: 'date-time', example: '2024-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}