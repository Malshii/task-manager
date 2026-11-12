import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskStatus } from './task-status.enum';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(() => {
    service = new TasksService();
  });

  describe('create', () => {
    it('generates id and createdAt and defaults status to TODO', () => {
      const task = service.create({ title: 'Write docs' });

      expect(task.id).toEqual(expect.any(String));
      expect(task.title).toBe('Write docs');
      expect(task.status).toBe(TaskStatus.TODO);
      expect(new Date(task.createdAt).toISOString()).toBe(task.createdAt);
    });

    it('keeps the provided optional fields', () => {
      const task = service.create({
        title: 'Ship',
        description: 'Release it',
        status: TaskStatus.IN_PROGRESS,
        dueDate: '2026-12-01',
      });

      expect(task).toMatchObject({
        description: 'Release it',
        status: TaskStatus.IN_PROGRESS,
        dueDate: '2026-12-01',
      });
    });
  });

  describe('findAll', () => {
    it('returns an empty array when there are no tasks', () => {
      expect(service.findAll()).toEqual([]);
    });

    it('returns every created task', () => {
      const first = service.create({ title: 'One' });
      const second = service.create({ title: 'Two' });

      expect(service.findAll()).toEqual([first, second]);
    });
  });

  describe('findOne', () => {
    it('returns the task with the given id', () => {
      const task = service.create({ title: 'One' });

      expect(service.findOne(task.id)).toEqual(task);
    });

    it('throws NotFoundException for an unknown id', () => {
      expect(() => service.findOne('missing')).toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates only the provided fields', () => {
      const task = service.create({ title: 'Old', description: 'Keep me' });

      const updated = service.update(task.id, {
        title: 'New',
        status: TaskStatus.DONE,
      });

      expect(updated).toMatchObject({
        id: task.id,
        title: 'New',
        status: TaskStatus.DONE,
        description: 'Keep me',
        createdAt: task.createdAt,
      });
      expect(service.findOne(task.id)).toEqual(updated);
    });

    it('leaves the task unchanged when given an empty update', () => {
      const task = service.create({ title: 'Same', dueDate: '2026-12-01' });

      expect(service.update(task.id, {})).toEqual(task);
    });

    it('clears dueDate and description when they are null', () => {
      const task = service.create({
        title: 'Clear',
        description: 'Remove me',
        dueDate: '2026-12-01',
      });

      const updated = service.update(task.id, {
        dueDate: null,
        description: null,
      });

      expect(updated.dueDate).toBeUndefined();
      expect(updated.description).toBeUndefined();
      expect(JSON.parse(JSON.stringify(updated))).not.toHaveProperty('dueDate');
    });

    it('throws NotFoundException for an unknown id', () => {
      expect(() => service.update('missing', { title: 'x' })).toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes the task', () => {
      const task = service.create({ title: 'Delete me' });

      service.remove(task.id);

      expect(service.findAll()).toEqual([]);
    });

    it('throws NotFoundException for an unknown id', () => {
      expect(() => service.remove('missing')).toThrow(NotFoundException);
    });
  });
});
