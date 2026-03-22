import { Router } from 'express';
import Database from 'better-sqlite3';

import {
  getAssetsReport,
  getCalendarReport,
  getLedgerReport,
  getShieldsReport,
} from '../domain/reports';

export function createReportsRouter(db: Database.Database) {
  const router = Router();

  router.get('/ledger', (_request, response) => {
    response.json(getLedgerReport(db));
  });

  router.get('/calendar', (request, response) => {
    const month = String(request.query.month ?? '');
    response.json(getCalendarReport(db, month));
  });

  router.get('/assets', (_request, response) => {
    response.json(getAssetsReport(db));
  });

  router.get('/shields', (_request, response) => {
    response.json(getShieldsReport(db));
  });

  return router;
}
