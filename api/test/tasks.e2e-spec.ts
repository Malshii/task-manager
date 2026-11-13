import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

describe('Tasks (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const createTask = async (body: object = { title: 'Write docs' }) => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .send(body)
      .expect(201);
    return res.body as { id: string; [key: string]: unknown };
  };

  describe('POST /tasks', () => {
    it.each([
      ['missing title', {}],
      ['empty title', { title: '' }],
      ['title over 200 chars', { title: 'a'.repeat(201) }],
      ['invalid status', { title: 'x', status: 'NOPE' }],
      ['invalid dueDate', { title: 'x', dueDate: 'tomorrow' }],
      ['null status', { title: 'x', status: null }],
      ['null description', { title: 'x', description: null }],
      ['null dueDate', { title: 'x', dueDate: null }],
      ['unknown property', { title: 'x', foo: 1 }],
    ])('returns 400 for %s', async (_name, body) => {
      await request(app.getHttpServer()).post('/tasks').send(body).expect(400);
    });
  });

  describe('GET /tasks/:id', () => {
    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer()).get('/tasks/unknown-id').expect(404);
    });
  });

  describe('PATCH /tasks/:id', () => {
    it.each([
      ['title null', { title: null }],
      ['title empty string', { title: '' }],
      ['status null', { status: null }],
      ['invalid status', { status: 'NOPE' }],
      ['invalid dueDate', { dueDate: 'tomorrow' }],
    ])('returns 400 for %s and leaves the task intact', async (_name, body) => {
      const task = await createTask({ title: 'Keep', status: 'TODO' });

      await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .send(body)
        .expect(400);

      const res = await request(app.getHttpServer())
        .get(`/tasks/${task.id}`)
        .expect(200);
      expect(res.body).toEqual(task);
    });

    it('clears dueDate when it is null', async () => {
      const task = await createTask({ title: 'Due', dueDate: '2026-12-01' });

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .send({ dueDate: null })
        .expect(200);

      expect(res.body).not.toHaveProperty('dueDate');
      expect(res.body).toMatchObject({ id: task.id, title: 'Due' });
    });

    it('leaves the task unchanged for an empty body', async () => {
      const task = await createTask({ title: 'Same', dueDate: '2026-12-01' });

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .send({})
        .expect(200);

      expect(res.body).toEqual(task);
    });

    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .patch('/tasks/unknown-id')
        .send({ title: 'x' })
        .expect(404);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('returns 404 for an unknown id', async () => {
      await request(app.getHttpServer())
        .delete('/tasks/unknown-id')
        .expect(404);
    });
  });

  it('supports the full create -> update -> delete flow', async () => {
    const created = await createTask({ title: 'Flow' });
    expect(created).toMatchObject({ title: 'Flow', status: 'TODO' });
    expect(created.createdAt).toEqual(expect.any(String));

    const updated = await request(app.getHttpServer())
      .patch(`/tasks/${created.id}`)
      .send({ title: 'Flow (done)', status: 'DONE' })
      .expect(200);
    expect(updated.body).toMatchObject({
      id: created.id,
      title: 'Flow (done)',
      status: 'DONE',
    });

    const list = await request(app.getHttpServer()).get('/tasks').expect(200);
    expect(list.body).toEqual([updated.body]);

    await request(app.getHttpServer())
      .delete(`/tasks/${created.id}`)
      .expect(204);
    await request(app.getHttpServer()).get(`/tasks/${created.id}`).expect(404);
  });
});
