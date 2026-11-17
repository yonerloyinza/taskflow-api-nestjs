import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService, PRISMA_CLIENT } from '../src/tasks/tasks.service.js';
import { CreateTaskDto } from '../src/tasks/dto/create-task.dto.js';
import { UpdateTaskDto } from '../src/tasks/dto/update-task.dto.js';
import { TaskStatus } from '../src/tasks/enums/task-status.enum.js';
import { TaskPriority } from '../src/tasks/enums/task-priority.enum.js';

const mockPrisma = {
  task: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
};

describe('TasksService (unit)', () => {
  let service: TasksService;
  let module: TestingModule;

  beforeEach(async () => {
    vi.clearAllMocks();
    module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PRISMA_CLIENT,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get(TasksService);
  });

  afterEach(async () => {
    await module.close();
  });

  const mockTask = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.Pendiente,
    priority: TaskPriority.Media,
    assignee: 'Juan Pérez',
    dueDate: new Date('2024-12-31T23:59:59.000Z'),
    createdAt: new Date('2024-11-17T10:00:00.000Z'),
    updatedAt: new Date('2024-11-17T10:00:00.000Z'),
  };

  describe('create', () => {
    it('should create a task with defaults', async () => {
      const dto: CreateTaskDto = {
        title: 'Test Task',
        assignee: 'Juan Pérez',
        dueDate: '2024-12-31T23:59:59.000Z',
      };
      mockPrisma.task.create.mockResolvedValue(mockTask);

      const result = await service.create(dto);

      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Task',
          description: null,
          status: 'pendiente',
          priority: 'media',
          assignee: 'Juan Pérez',
          dueDate: new Date('2024-12-31T23:59:59.000Z'),
        },
      });
      expect(result).toEqual({
        id: mockTask.id,
        title: mockTask.title,
        description: mockTask.description,
        status: mockTask.status,
        priority: mockTask.priority,
        assignee: mockTask.assignee,
        dueDate: mockTask.dueDate.toISOString(),
        createdAt: mockTask.createdAt.toISOString(),
        updatedAt: mockTask.updatedAt.toISOString(),
      });
    });

    it('should create a task with custom status and priority', async () => {
      const dto: CreateTaskDto = {
        title: 'Test Task',
        assignee: 'Juan Pérez',
        dueDate: '2024-12-31T23:59:59.000Z',
        status: TaskStatus.EnCurso,
        priority: TaskPriority.Alta,
      };
      mockPrisma.task.create.mockResolvedValue({ ...mockTask, status: TaskStatus.EnCurso, priority: TaskPriority.Alta });

      const result = await service.create(dto);

      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: TaskStatus.EnCurso,
          priority: TaskPriority.Alta,
        }),
      });
      expect(result.status).toBe(TaskStatus.EnCurso);
      expect(result.priority).toBe(TaskPriority.Alta);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks with filters', async () => {
      const tasks = [mockTask];
      mockPrisma.task.findMany.mockResolvedValue(tasks);
      mockPrisma.task.count.mockResolvedValue(1);

      const result = await service.findAll(TaskStatus.Pendiente, TaskPriority.Media, 'Juan', 1, 10);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          status: TaskStatus.Pendiente,
          priority: TaskPriority.Media,
          assignee: { contains: 'Juan', mode: 'insensitive' },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.lastPage).toBe(1);
    });

    it('should return empty array when no tasks', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.task.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.lastPage).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.findOne(mockTask.id);

      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({ where: { id: mockTask.id } });
      expect(result.id).toBe(mockTask.id);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task partially', async () => {
      const dto: UpdateTaskDto = { title: 'Updated Title', status: TaskStatus.Hecha };
      const updatedTask = { ...mockTask, title: 'Updated Title', status: TaskStatus.Hecha };
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.task.update.mockResolvedValue(updatedTask);

      const result = await service.update(mockTask.id, dto);

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: mockTask.id },
        data: { title: 'Updated Title', status: TaskStatus.Hecha },
      });
      expect(result.title).toBe('Updated Title');
      expect(result.status).toBe(TaskStatus.Hecha);
    });

    it('should throw NotFoundException when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', { title: 'New' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      mockPrisma.task.delete.mockResolvedValue(void 0);

      await service.delete(mockTask.id);

      expect(mockPrisma.task.delete).toHaveBeenCalledWith({ where: { id: mockTask.id } });
    });

    it('should throw NotFoundException when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});