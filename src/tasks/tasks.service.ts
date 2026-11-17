import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaClient, TaskStatus as PrismaTaskStatus, TaskPriority as PrismaTaskPriority, Prisma } from '@prisma/client';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskResponseDto, PaginatedTasksResponseDto } from './dto/task-response.dto.js';
import { TaskStatus } from './enums/task-status.enum.js';
import { TaskPriority } from './enums/task-priority.enum.js';

export const PRISMA_CLIENT = 'PRISMA_CLIENT';

@Injectable()
export class TasksService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: PrismaClient) {}

  async create(dto: CreateTaskDto): Promise<TaskResponseDto> {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        status: dto.status ?? PrismaTaskStatus.pendiente,
        priority: dto.priority ?? PrismaTaskPriority.media,
        assignee: dto.assignee,
        dueDate: new Date(dto.dueDate),
      },
    });
    return this.toResponse(task);
  }

  async findAll(
    status?: TaskStatus,
    priority?: TaskPriority,
    assignee?: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedTasksResponseDto> {
    const where: Prisma.TaskWhereInput = {};
    if (status) where.status = status as PrismaTaskStatus;
    if (priority) where.priority = priority as PrismaTaskPriority;
    if (assignee) where.assignee = { contains: assignee, mode: 'insensitive' };

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: tasks.map((t) => this.toResponse(t)),
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Tarea no encontrada');
    return this.toResponse(task);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Tarea no encontrada');

    const data: Prisma.TaskUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description ?? null;
    if (dto.status !== undefined) data.status = dto.status as PrismaTaskStatus;
    if (dto.priority !== undefined) data.priority = dto.priority as PrismaTaskPriority;
    if (dto.assignee !== undefined) data.assignee = dto.assignee;
    if (dto.dueDate !== undefined) data.dueDate = new Date(dto.dueDate);

    const updated = await this.prisma.task.update({ where: { id }, data });
    return this.toResponse(updated);
  }

  async delete(id: string): Promise<void> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Tarea no encontrada');
    await this.prisma.task.delete({ where: { id } });
  }

  private toResponse(task: {
    id: string;
    title: string;
    description: string | null;
    status: PrismaTaskStatus;
    priority: PrismaTaskPriority;
    assignee: string;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
  }): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      assignee: task.assignee,
      dueDate: task.dueDate.toISOString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}