import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createServerApp } from '../app';

describe('final liquidation API', () => {
  it('previews and executes final liquidation once', async () => {
    const app = createServerApp({ databasePath: ':memory:' });

    await request(app).post('/api/settlement').send({
      eventDate: '2026-03-20',
      missedItems: [],
      severeViolation: false,
      note: null,
    });

    await request(app).post('/api/adjustments').send({
      eventDate: '2026-03-21',
      amountDelta: 20,
      reason: 'Bonus',
      source: 'school',
      note: null,
    });

    const addShieldAppResponse = await request(app).post('/api/adjustments').send({
      eventDate: '2026-03-22',
      amountDelta: 0,
      reason: 'Seed shield state',
      source: 'system',
      note: null,
      shieldDelta: 2,
    });

    expect(addShieldAppResponse.status).toBe(201);

    const preview = await request(app).get(
      '/api/final-liquidation/preview?eventDate=2026-07-31',
    );

    expect(preview.status).toBe(200);
    expect(preview.body.preview.shieldConversion).toBe(60);
    expect(preview.body.preview.finalBalance).toBe(205);

    const execute = await request(app).post('/api/final-liquidation').send({
      eventDate: '2026-07-31',
    });

    expect(execute.status).toBe(200);
    expect(execute.body.preview.finalBalance).toBe(205);

    const duplicate = await request(app).post('/api/final-liquidation').send({
      eventDate: '2026-07-31',
    });

    expect(duplicate.status).toBe(409);
  });
});
