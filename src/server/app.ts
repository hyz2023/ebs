import express from 'express';

import { createAppDatabase } from './db/connection';
import { createAdjustmentsRouter } from './routes/adjustments';
import { createAccountRouter } from './routes/account';
import { createFinalLiquidationRouter } from './routes/final-liquidation';
import { createReportsRouter } from './routes/reports';
import { createSettlementRouter } from './routes/settlement';

export function createServerApp(options?: { databasePath?: string }) {
  const app = express();
  const db = createAppDatabase(options?.databasePath ?? 'ebs.sqlite');

  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.use('/api/account', createAccountRouter(db));
  app.use('/api/settlement', createSettlementRouter(db));
  app.use('/api/adjustments', createAdjustmentsRouter(db));
  app.use('/api/reports', createReportsRouter(db));
  app.use('/api/final-liquidation', createFinalLiquidationRouter(db));

  return app;
}
