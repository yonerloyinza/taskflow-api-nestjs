import { IsString, IsOptional, IsEnum, IsDateString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../enums/task-status.enum.js';
import { TaskPriority } from '../enums/task-priority.enum.js';

export class CreateTaskDto {
  @ApiProperty({ minLength: 3, maxLength: 100, example: 'Comprar leche' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ maxLength: 500, example: 'Leche entera 1L' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.Pendiente })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.Media })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiProperty({ maxLength: 100, example: 'Juan Pérez' })
  @IsString()
  @MaxLength(100)
  assignee: string;

  @ApiProperty({ format: 'date-time', example: '2024-12-31T23:59:59.000Z' })
  @IsDateString()
  dueDate: string;
}