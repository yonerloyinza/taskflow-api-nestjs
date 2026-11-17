import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../enums/task-status.enum.js';
import { TaskPriority } from '../enums/task-priority.enum.js';

export class TaskResponseDto {
  @ApiProperty({ format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ minLength: 3, maxLength: 100, example: 'Comprar leche' })
  title: string;

  @ApiProperty({ maxLength: 500, nullable: true, example: 'Leche entera 1L' })
  description: string | null;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.Pendiente })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.Media })
  priority: TaskPriority;

  @ApiProperty({ maxLength: 100, example: 'Juan Pérez' })
  assignee: string;

  @ApiProperty({ format: 'date-time', example: '2024-12-31T23:59:59.000Z' })
  dueDate: string;

  @ApiProperty({ format: 'date-time', example: '2024-11-17T10:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ format: 'date-time', example: '2024-11-17T10:00:00.000Z' })
  updatedAt: string;
}

export class PaginatedMetaDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  lastPage: number;
}

export class PaginatedTasksResponseDto {
  @ApiProperty({ type: [TaskResponseDto] })
  data: TaskResponseDto[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta: PaginatedMetaDto;
}