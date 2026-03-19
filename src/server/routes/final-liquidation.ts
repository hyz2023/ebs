import { Router } from 'express';
import Database from 'better-sqlite3';

import {
  executeFinalLiquidation,
  previewFinalLiquidation,
} from '../domain/final-liquidation';

export function createFinalLiquidationRouter(db: Database.Database) {
  const router = Router();

  router.get('/preview', (request, response) => {
    response.json(previewFinalLiquidation(db, String(request.query.eventDate)));
  });

  router.post('/', (request, response) => {
    try {
      response.json(executeFinalLiquidation(db, String(request.body.eventDate)));
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('already been executed')
      ) {
        response.status(409).json({ error: error.message });
        return;
      }

      response.status(400).json({
        error: error instanceof Error ? error.message : 'Final liquidation failed',
      });
    }
  });

  return router;
}
