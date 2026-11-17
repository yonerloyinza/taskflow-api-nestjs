import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('TasksController (e2e)', () => {
  let app: INestApplication;
  let createdTaskId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  describe('/tasks (POST)', () => {
    it('should create a new task', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Test Task',
          description: 'Test Description',
          assignee: 'Juan Pérez',
          dueDate: '2024-12-31T23:59:59.000Z',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        title: 'Test Task',
        description: 'Test Description',
        status: 'pendiente',
        priority: 'media',
        assignee: 'Juan Pérez',
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.dueDate).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();

      createdTaskId = response.body.id;
    });

    it('should create a task with custom status and priority', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Test Task 2',
          assignee: 'María García',
          dueDate: '2024-12-31T23:59:59.000Z',
          status: 'en_curso',
          priority: 'alta',
        })
        .expect(201);

      expect(response.body.status).toBe('en_curso');
      expect(response.body.priority).toBe('alta');
    });

    it('should return 400 for invalid title (too short)', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Ab',
          assignee: 'Juan Pérez',
          dueDate: '2024-12-31T23:59:59.000Z',
        })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.message).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.path).toBe('/tasks');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send({})
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toContain('title must be a string');
    });
  });

  describe('/tasks (GET)', () => {
    it('should return paginated tasks', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toMatchObject({
        total: expect.any(Number),
        page: 1,
        limit: 10,
        lastPage: expect.any(Number),
      });
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks?status=pendiente')
        .expect(200);

      response.body.data.forEach((task: any) => {
        expect(task.status).toBe('pendiente');
      });
    });

    it('should filter by priority', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks?priority=media')
        .expect(200);

      response.body.data.forEach((task: any) => {
        expect(task.priority).toBe('media');
      });
    });

    it('should filter by assignee (case insensitive)', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks?assignee=juan')
        .expect(200);

      response.body.data.forEach((task: any) => {
        expect(task.assignee.toLowerCase()).toContain('juan');
      });
    });

    it('should respect pagination parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks?page=1&limit=5')
        .expect(200);

      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('/tasks/:id (GET)', () => {
    it('should return a task by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tasks/${createdTaskId}`)
        .expect(200);

      expect(response.body.id).toBe(createdTaskId);
      expect(response.body.title).toBe('Test Task');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks/123e4567-e89b-12d3-a456-426614174999')
        .expect(404);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.error).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks/invalid-uuid')
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('/tasks/:id (PATCH)', () => {
    it('should update a task partially', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tasks/${createdTaskId}`)
        .send({
          title: 'Updated Task',
          status: 'hecha',
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Task');
      expect(response.body.status).toBe('hecha');
    });

    it('should return 404 for non-existent task', async () => {
      await request(app.getHttpServer())
        .patch('/tasks/123e4567-e89b-12d3-a456-426614174999')
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('/tasks/:id (DELETE)', () => {
    it('should delete a task', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${createdTaskId}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/tasks/${createdTaskId}`)
        .expect(404);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app.getHttpServer())
        .delete('/tasks/123e4567-e89b-12d3-a456-426614174999')
        .expect(404);
    });
  });

  describe('/health (GET)', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        service: 'taskflow-api-nestjs',
        database: 'up',
      });
      expect(response.body.timestamp).toBeDefined();
    });
  });
});