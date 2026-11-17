import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TaskResponseDto, PaginatedTasksResponseDto } from './dto/task-response.dto.js';
import { TaskStatus } from './enums/task-status.enum.js';
import { TaskPriority } from './enums/task-priority.enum.js';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  @ApiResponse({ status: 201, description: 'Tarea creada', type: TaskResponseDto })
  @ApiResponse({ status: 400, description: 'Error de validación' })
  async create(@Body() dto: CreateTaskDto): Promise<TaskResponseDto> {
    return this.tasksService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tareas con filtros y paginación' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  @ApiQuery({ name: 'priority', enum: TaskPriority, required: false })
  @ApiQuery({ name: 'assignee', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Listado paginado de tareas', type: PaginatedTasksResponseDto })
  async findAll(
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
    @Query('assignee') assignee?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<PaginatedTasksResponseDto> {
    return this.tasksService.findAll(status, priority, assignee, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una tarea' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Tarea encontrada', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TaskResponseDto> {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar parcialmente una tarea' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Tarea actualizada', type: TaskResponseDto })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una tarea' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Tarea eliminada sin contenido' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.tasksService.delete(id);
  }
}