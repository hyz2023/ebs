import { Router } from 'express';
import Database from 'better-sqlite3';

import { createExternalAdjustment } from '../domain/external-adjustments';

export function createAdjustmentsRouter(db: Database.Database) {
  const router = Router();

  router.post('/', (request, response) => {
    const result = createExternalAdjustment(db, {
      eventDate: request.body.eventDate,
      amountDelta: Number(request.body.amountDelta),
      reason: request.body.reason,
      source: request.body.source,
      note: request.body.note ?? null,
      shieldDelta:
        request.body.shieldDelta === undefined
          ? undefined
          : Number(request.body.shieldDelta),
    });

    response.status(201).json(result);
  });

  return router;
}
