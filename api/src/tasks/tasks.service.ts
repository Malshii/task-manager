import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TaskStatus } from './task-status.enum';

@Injectable()
export class TasksService {
  private readonly tasks = new Map<string, Task>();

  create(dto: CreateTaskDto): Task {
    const task: Task = {
      ...dto,
      id: randomUUID(),
      status: dto.status ?? TaskStatus.TODO,
      createdAt: new Date().toISOString(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  findAll(): Task[] {
    return [...this.tasks.values()];
  }

  findOne(id: string): Task {
    const task = this.tasks.get(id);
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  update(id: string, dto: UpdateTaskDto): Task {
    const { description, dueDate, ...fields } = dto;
    const updated: Task = { ...this.findOne(id), ...fields };
    // null means "clear"; omitted means "leave unchanged".
    if (description !== undefined)
      updated.description = description ?? undefined;
    if (dueDate !== undefined) updated.dueDate = dueDate ?? undefined;
    this.tasks.set(id, updated);
    return updated;
  }

  remove(id: string): void {
    this.findOne(id);
    this.tasks.delete(id);
  }
}
