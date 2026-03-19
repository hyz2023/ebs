import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createServerApp } from '../app';

describe('server bootstrap', () => {
  it('creates an express app with a health endpoint', async () => {
    const app = createServerApp();

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('returns the current account summary', async () => {
    const app = createServerApp({ databasePath: ':memory:' });

    const response = await request(app).get('/api/account');

    expect(response.status).toBe(200);
    expect(response.body.account.balance).toBe(100);
    expect(response.body.account.streakCount).toBe(0);
    expect(response.body.account.shieldStock).toBe(0);
  });

  it('records a daily settlement through the API', async () => {
    const app = createServerApp({ databasePath: ':memory:' });

    const response = await request(app).post('/api/settlement').send({
      eventDate: '2026-03-20',
      missedItems: [],
      severeViolation: false,
      note: null,
    });

    expect(response.status).toBe(200);
    expect(response.body.level).toBe(1);
    expect(response.body.account.balance).toBe(125);
    expect(response.body.account.streakCount).toBe(1);
  });

  it('rejects duplicate settlement for the same day', async () => {
    const app = createServerApp({ databasePath: ':memory:' });

    await request(app).post('/api/settlement').send({
      eventDate: '2026-03-20',
      missedItems: [],
      severeViolation: false,
      note: null,
    });

    const duplicate = await request(app).post('/api/settlement').send({
      eventDate: '2026-03-20',
      missedItems: [],
      severeViolation: false,
      note: null,
    });

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error).toMatch(/already recorded/i);
  });
});
