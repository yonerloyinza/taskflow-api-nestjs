import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async health() {
    return {
      status: 'ok',
      service: 'taskflow-api-nestjs',
      database: 'up',
      timestamp: new Date().toISOString(),
    };
  }
}