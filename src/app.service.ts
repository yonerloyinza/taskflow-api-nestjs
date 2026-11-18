import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AppService {
  private readonly prisma = new PrismaClient();

  getHello(): string {
    return 'Hello World!';
  }

  async health() {
    let database = 'down';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      database = 'up';
    } catch {
      database = 'down';
    }

    return {
      status: database === 'up' ? 'ok' : 'error',
      service: 'taskflow-api-nestjs',
      database,
      timestamp: new Date().toISOString(),
    };
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}