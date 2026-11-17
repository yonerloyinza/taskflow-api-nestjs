import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service.js';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Verificar salud de la API y conexión a PostgreSQL Cloud' })
  @ApiResponse({ status: 200, description: 'Servicio y base de datos operativos' })
  @ApiResponse({ status: 503, description: 'Base de datos inaccesible' })
  async health() {
    return this.appService.health();
  }
}