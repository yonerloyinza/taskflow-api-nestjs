import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TasksController } from './tasks.controller.js';
import { TasksService, PRISMA_CLIENT } from './tasks.service.js';

@Module({
  controllers: [TasksController],
  providers: [
    {
      provide: PRISMA_CLIENT,
      useFactory: () => new PrismaClient(),
    },
    TasksService,
  ],
  exports: [TasksService],
})
export class TasksModule {}