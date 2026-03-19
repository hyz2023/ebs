import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createServerApp } from '../app';

describe('reports and adjustment APIs', () => {
  it('creates an external adjustment and returns it in the ledger report', async () => {
    const app = createServerApp({ databasePath: ':memory:' });

    const createResponse = await request(app).post('/api/adjustments').send({
      eventDate: '2026-03-21',
      amountDelta: 30,
      reason: 'School reward',
      source: 'school',
      note: 'Great classroom focus',
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.event.eventType).toBe('EXTERNAL_ADJUSTMENT');
    expect(createResponse.body.account.balance).toBe(130);

    const ledgerResponse = await request(app).get('/api/reports/ledger');

    expect(ledgerResponse.status).toBe(200);
    expect(ledgerResponse.body.items[0].eventType).toBe('EXTERNAL_ADJUSTMENT');
    expect(ledgerResponse.body.items[0].reason).toBe('School reward');
  });

  it('builds calendar and asset reports from recorded events', async () => {
    const app = createServerApp({ databasePath: ':memory:' });

    await request(app).post('/api/settlement').send({
      eventDate: '2026-03-20',
      missedItems: [],
      severeViolation: false,
      note: null,
    });

    await request(app).post('/api/settlement').send({
      eventDate: '2026-03-21',
      missedItems: ['fuel'],
      severeViolation: false,
      note: 'Missed one item',
    });

    await request(app).post('/api/adjustments').send({
      eventDate: '2026-03-21',
      amountDelta: -10,
      reason: 'Snack overspend',
      source: 'outside',
      note: 'Unexpected purchase',
    });

    const calendarResponse = await request(app).get(
      '/api/reports/calendar?month=2026-03',
    );

    expect(calendarResponse.status).toBe(200);
    expect(
      calendarResponse.body.days.find((day: { date: string }) => day.date === '2026-03-20')
        .level,
    ).toBe(1);
    expect(
      calendarResponse.body.days.find((day: { date: string }) => day.date === '2026-03-21')
        .hasExternalAdjustment,
    ).toBe(true);

    const assetsResponse = await request(app).get('/api/reports/assets');

    expect(assetsResponse.status).toBe(200);
    expect(assetsResponse.body.balancePoints.at(-1).balance).toBe(140);
    expect(
      assetsResponse.body.incomeBreakdown.find(
        (item: { key: string }) => item.key === 'base_rewards',
      ).amount,
    ).toBe(50);
    expect(
      assetsResponse.body.incomeBreakdown.find(
        (item: { key: string }) => item.key === 'external_adjustments',
      ).amount,
    ).toBe(-10);
  });
});
