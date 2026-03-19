import { Router } from 'express';
import Database from 'better-sqlite3';

import { settleDay } from '../domain/settlement';

export function createSettlementRouter(db: Database.Database) {
  const router = Router();

  router.post('/', (request, response) => {
    try {
      const result = settleDay(db, {
        eventDate: request.body.eventDate,
        missedItems: request.body.missedItems ?? [],
        severeViolation: Boolean(request.body.severeViolation),
        consumeShield: Boolean(request.body.consumeShield),
        note: request.body.note ?? null,
      });

      response.json(result);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('already recorded')
      ) {
        response.status(409).json({ error: error.message });
        return;
      }

      response.status(400).json({
        error: error instanceof Error ? error.message : 'Unknown settlement error',
      });
    }
  });

  return router;
}
