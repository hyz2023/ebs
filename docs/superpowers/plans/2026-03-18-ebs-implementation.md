# EBS Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working version of EBS as a mobile-first browser app with a Node/Express server, SQLite persistence, daily settlement logic, reporting, and lightweight platform-style UI feedback.

**Architecture:** Use a single TypeScript repository with an Express server, SQLite database, and a React/Vite frontend. Keep business logic on the server, expose a minimal JSON API, and model all money/state changes as durable ledger events plus a current account snapshot.

**Tech Stack:** Node.js, TypeScript, Express, SQLite (`better-sqlite3`), React, Vite, Vitest, React Testing Library, Supertest

---

## File Structure

Planned project structure for the greenfield implementation:

- `package.json`
  Purpose: workspace scripts and dependencies for server, client, test, and build.
- `tsconfig.json`
  Purpose: shared TypeScript compiler configuration.
- `vite.config.ts`
  Purpose: Vite frontend bundling and dev proxy to the server.
- `index.html`
  Purpose: frontend app shell for Vite.
- `src/server/app.ts`
  Purpose: create and configure the Express app.
- `src/server/index.ts`
  Purpose: start the HTTP server.
- `src/server/config.ts`
  Purpose: centralize runtime config such as port, database path, and backup directory.
- `src/server/db/connection.ts`
  Purpose: open the SQLite database and expose the shared connection.
- `src/server/db/schema.ts`
  Purpose: initialize tables and indexes.
- `src/server/db/seed.ts`
  Purpose: initialize the default single account state when the database is empty.
- `src/server/domain/types.ts`
  Purpose: shared domain types for settlement, events, snapshots, and reports.
- `src/server/domain/rules.ts`
  Purpose: date-window logic, milestone logic, and settlement rule helpers.
- `src/server/domain/settlement.ts`
  Purpose: core settlement transaction orchestration.
- `src/server/domain/external-adjustments.ts`
  Purpose: create external adjustment events.
- `src/server/domain/reports.ts`
  Purpose: produce calendar, asset, and ledger report payloads.
- `src/server/repositories/account-repository.ts`
  Purpose: load and update account snapshot state.
- `src/server/repositories/event-repository.ts`
  Purpose: insert and query ledger events.
- `src/server/routes/health.ts`
  Purpose: health endpoint.
- `src/server/routes/account.ts`
  Purpose: current account summary and today-state endpoint.
- `src/server/routes/settlement.ts`
  Purpose: daily settlement endpoint.
- `src/server/routes/adjustments.ts`
  Purpose: external adjustment create endpoint.
- `src/server/routes/reports.ts`
  Purpose: calendar, assets, and ledger report endpoints.
- `src/server/routes/final-liquidation.ts`
  Purpose: final liquidation preview and execute endpoints.
- `src/server/lib/backup.ts`
  Purpose: SQLite file backup utility.
- `src/server/lib/date.ts`
  Purpose: consistent date helpers using system-local business dates.
- `src/server/lib/http-errors.ts`
  Purpose: normalized API error responses.
- `src/server/tests/settlement.test.ts`
  Purpose: rule engine and settlement transaction coverage.
- `src/server/tests/adjustments.test.ts`
  Purpose: external adjustment behavior coverage.
- `src/server/tests/reports.test.ts`
  Purpose: report payload coverage.
- `src/server/tests/final-liquidation.test.ts`
  Purpose: end-period liquidation coverage.
- `src/server/tests/api.test.ts`
  Purpose: endpoint integration coverage with Supertest.
- `src/client/main.tsx`
  Purpose: frontend bootstrap.
- `src/client/App.tsx`
  Purpose: top-level app shell and route layout.
- `src/client/styles/theme.css`
  Purpose: global design tokens and base styles.
- `src/client/styles/app.css`
  Purpose: app-level layout styles.
- `src/client/lib/api.ts`
  Purpose: typed frontend API client.
- `src/client/lib/types.ts`
  Purpose: frontend API response types.
- `src/client/hooks/useAccount.ts`
  Purpose: fetch and refresh account summary.
- `src/client/hooks/useReports.ts`
  Purpose: fetch calendar, assets, and ledger data.
- `src/client/components/TopStatusBar.tsx`
  Purpose: balance, streak, and shield summary strip.
- `src/client/components/TodaySettlementCard.tsx`
  Purpose: daily input and post-settlement result state.
- `src/client/components/SettlementResultModal.tsx`
  Purpose: result confirmation and milestone overlay.
- `src/client/components/NoviceBanner.tsx`
  Purpose: novice protection messaging.
- `src/client/components/BehaviorCalendar.tsx`
  Purpose: month grid and status indicators.
- `src/client/components/DayDetailDrawer.tsx`
  Purpose: day detail drawer for calendar interactions.
- `src/client/components/BalanceTrendChart.tsx`
  Purpose: balance trend visualization.
- `src/client/components/IncomeBreakdownChart.tsx`
  Purpose: income-source composition visualization.
- `src/client/components/LedgerList.tsx`
  Purpose: mobile-friendly event list.
- `src/client/components/ExternalAdjustmentForm.tsx`
  Purpose: create external adjustment entries.
- `src/client/components/BottomNav.tsx`
  Purpose: four-tab app navigation.
- `src/client/routes/TodayPage.tsx`
  Purpose: today view.
- `src/client/routes/CalendarPage.tsx`
  Purpose: calendar view.
- `src/client/routes/AssetsPage.tsx`
  Purpose: financial reporting view.
- `src/client/routes/LedgerPage.tsx`
  Purpose: ledger and external adjustment view.
- `src/client/tests/TodayPage.test.tsx`
  Purpose: frontend behavior for daily settlement flow.
- `src/client/tests/CalendarPage.test.tsx`
  Purpose: calendar rendering and day detail interactions.
- `src/client/tests/AssetsPage.test.tsx`
  Purpose: report rendering tests.
- `src/client/tests/LedgerPage.test.tsx`
  Purpose: ledger and adjustment flow tests.

## Chunk 1: Scaffold and Tooling

### Task 1: Initialize workspace scripts and TypeScript configuration

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`

- [ ] **Step 1: Write the failing configuration smoke check**

Create a minimal script target plan in `package.json` that includes `dev`, `build`, `test`, and `test:server`.

- [ ] **Step 2: Run dependency-less validation**

Run: `node -e "const p=require('./package.json'); console.log(['dev','build','test','test:server'].every(k=>p.scripts[k]))"`
Expected: print `true`

- [ ] **Step 3: Add minimal implementation**

Define the base package metadata, TypeScript config, Vite config, and app shell.

- [ ] **Step 4: Run configuration verification**

Run: `node -e "const p=require('./package.json'); console.log(p.type, !!p.scripts.dev, !!p.scripts.build)"`
Expected: print `module true true`

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json vite.config.ts index.html
git commit -m "chore: initialize EBS TypeScript workspace"
```

### Task 2: Create server and client directory skeleton

**Files:**
- Create: `src/server/app.ts`
- Create: `src/server/index.ts`
- Create: `src/client/main.tsx`
- Create: `src/client/App.tsx`
- Create: `src/client/styles/theme.css`
- Create: `src/client/styles/app.css`

- [ ] **Step 1: Write the failing bootstrap test notes**

Add placeholder exports and app roots so both server and client entrypoints can be imported without runtime errors.

- [ ] **Step 2: Run import smoke test**

Run: `node -e "import('./src/server/app.ts').then(()=>console.log('server ok')); import('./src/client/App.tsx').then(()=>console.log('client ok'))"`
Expected: fail until the files exist and export correctly

- [ ] **Step 3: Add minimal implementation**

Create a basic Express app export and a basic React app shell export.

- [ ] **Step 4: Run import smoke test again**

Run: `node -e "import('./src/server/app.ts').then(()=>console.log('server ok')); import('./src/client/App.tsx').then(()=>console.log('client ok'))"`
Expected: print `server ok` and `client ok`

- [ ] **Step 5: Commit**

```bash
git add src/server/app.ts src/server/index.ts src/client/main.tsx src/client/App.tsx src/client/styles/theme.css src/client/styles/app.css
git commit -m "chore: add initial server and client entrypoints"
```

## Chunk 2: Persistence and Domain Rules

### Task 3: Create SQLite connection and schema initialization

**Files:**
- Create: `src/server/config.ts`
- Create: `src/server/db/connection.ts`
- Create: `src/server/db/schema.ts`
- Create: `src/server/db/seed.ts`
- Test: `src/server/tests/api.test.ts`

- [ ] **Step 1: Write the failing database initialization test**

```ts
import { describe, expect, it } from 'vitest';
import { createAppDatabase } from '../db/connection';

describe('database initialization', () => {
  it('creates account and event tables', () => {
    const db = createAppDatabase(':memory:');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{ name: string }>;
    expect(tables.some((t) => t.name === 'account_snapshot')).toBe(true);
    expect(tables.some((t) => t.name === 'ledger_events')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:server -- src/server/tests/api.test.ts`
Expected: FAIL because the database helpers do not exist yet

- [ ] **Step 3: Write minimal implementation**

Implement config loading, SQLite connection setup, schema creation, and initial single-account seeding.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:server -- src/server/tests/api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/config.ts src/server/db/connection.ts src/server/db/schema.ts src/server/db/seed.ts src/server/tests/api.test.ts
git commit -m "feat: initialize SQLite schema and seed account"
```

### Task 4: Implement settlement rule helpers

**Files:**
- Create: `src/server/domain/types.ts`
- Create: `src/server/domain/rules.ts`
- Test: `src/server/tests/settlement.test.ts`

- [ ] **Step 1: Write the failing rule tests**

```ts
import { describe, expect, it } from 'vitest';
import { calculateSettlementLevel, isNoviceProtectionDate } from '../domain/rules';

describe('settlement rules', () => {
  it('returns level 1 when all daily items are complete', () => {
    expect(calculateSettlementLevel({ missedItems: [], severeViolation: false })).toBe(1);
  });

  it('returns level 2 when items are missed without severe violation', () => {
    expect(calculateSettlementLevel({ missedItems: ['fuel'], severeViolation: false })).toBe(2);
  });

  it('returns level 3 when severe violation is present', () => {
    expect(calculateSettlementLevel({ missedItems: [], severeViolation: true })).toBe(3);
  });

  it('identifies novice protection dates correctly', () => {
    expect(isNoviceProtectionDate('2026-03-20')).toBe(true);
    expect(isNoviceProtectionDate('2026-03-23')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:server -- src/server/tests/settlement.test.ts`
Expected: FAIL because the rule helpers are missing

- [ ] **Step 3: Write minimal implementation**

Implement pure rule helpers for level selection, novice protection dates, payout amounts, and milestone thresholds.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:server -- src/server/tests/settlement.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/domain/types.ts src/server/domain/rules.ts src/server/tests/settlement.test.ts
git commit -m "feat: add EBS settlement rule helpers"
```

### Task 5: Implement transactional settlement engine

**Files:**
- Create: `src/server/repositories/account-repository.ts`
- Create: `src/server/repositories/event-repository.ts`
- Create: `src/server/domain/settlement.ts`
- Modify: `src/server/tests/settlement.test.ts`

- [ ] **Step 1: Write the failing settlement engine tests**

Add tests for:
- level 1 settlement increments streak and adds `+25`
- novice-window level 2 pays `+25`
- normal level 2 pays `+15`
- level 2 with shield preserves streak and consumes one shield
- level 2 without shield breaks streak
- level 3 resets streak and applies `-50`
- 3, 7, 14, and 21 day milestones create the right event sequence

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:server -- src/server/tests/settlement.test.ts`
Expected: FAIL because transactional settlement logic is not implemented

- [ ] **Step 3: Write minimal implementation**

Implement snapshot loading, duplicate-settlement protection, event inserts, account updates, milestone handling, and transaction rollback behavior.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:server -- src/server/tests/settlement.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/repositories/account-repository.ts src/server/repositories/event-repository.ts src/server/domain/settlement.ts src/server/tests/settlement.test.ts
git commit -m "feat: implement transactional daily settlement engine"
```

## Chunk 3: Server API and Backups

### Task 6: Expose account and settlement API endpoints

**Files:**
- Create: `src/server/lib/http-errors.ts`
- Create: `src/server/lib/date.ts`
- Create: `src/server/routes/health.ts`
- Create: `src/server/routes/account.ts`
- Create: `src/server/routes/settlement.ts`
- Modify: `src/server/app.ts`
- Modify: `src/server/tests/api.test.ts`

- [ ] **Step 1: Write the failing API tests**

Add endpoint tests for:
- `GET /api/health`
- `GET /api/account`
- `POST /api/settlement`
- duplicate same-day settlement conflict

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:server -- src/server/tests/api.test.ts`
Expected: FAIL because the routes are not mounted yet

- [ ] **Step 3: Write minimal implementation**

Mount the health, account, and settlement routes, validate payloads, and normalize conflict and validation errors.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:server -- src/server/tests/api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/lib/http-errors.ts src/server/lib/date.ts src/server/routes/health.ts src/server/routes/account.ts src/server/routes/settlement.ts src/server/app.ts src/server/tests/api.test.ts
git commit -m "feat: add account and settlement API routes"
```

### Task 7: Add external adjustment and report endpoints

**Files:**
- Create: `src/server/domain/external-adjustments.ts`
- Create: `src/server/domain/reports.ts`
- Create: `src/server/routes/adjustments.ts`
- Create: `src/server/routes/reports.ts`
- Modify: `src/server/tests/adjustments.test.ts`
- Modify: `src/server/tests/reports.test.ts`
- Modify: `src/server/tests/api.test.ts`

- [ ] **Step 1: Write the failing tests**

Add tests for:
- creating an external adjustment event
- calendar payload color/status mapping
- balance trend payload
- income-source breakdown payload
- ledger payload ordering

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:server -- src/server/tests/adjustments.test.ts src/server/tests/reports.test.ts src/server/tests/api.test.ts`
Expected: FAIL because adjustment and report logic is not implemented

- [ ] **Step 3: Write minimal implementation**

Implement adjustment creation, report queries, and mount `/api/adjustments` and `/api/reports/*` routes.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:server -- src/server/tests/adjustments.test.ts src/server/tests/reports.test.ts src/server/tests/api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/domain/external-adjustments.ts src/server/domain/reports.ts src/server/routes/adjustments.ts src/server/routes/reports.ts src/server/tests/adjustments.test.ts src/server/tests/reports.test.ts src/server/tests/api.test.ts
git commit -m "feat: add adjustment and report APIs"
```

### Task 8: Add final liquidation and backup support

**Files:**
- Create: `src/server/routes/final-liquidation.ts`
- Create: `src/server/lib/backup.ts`
- Modify: `src/server/tests/final-liquidation.test.ts`
- Modify: `src/server/tests/api.test.ts`

- [ ] **Step 1: Write the failing tests**

Add tests for:
- liquidation preview returns computed shield conversion
- liquidation execution creates final event and prevents duplicate execution
- backup helper copies the SQLite file to the backup directory

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test:server -- src/server/tests/final-liquidation.test.ts src/server/tests/api.test.ts`
Expected: FAIL because liquidation and backup code is missing

- [ ] **Step 3: Write minimal implementation**

Implement liquidation preview and execute endpoints plus a file-copy backup helper callable from a script or scheduler.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test:server -- src/server/tests/final-liquidation.test.ts src/server/tests/api.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/server/routes/final-liquidation.ts src/server/lib/backup.ts src/server/tests/final-liquidation.test.ts src/server/tests/api.test.ts
git commit -m "feat: add final liquidation and backup support"
```

## Chunk 4: Frontend Shell and Today Flow

### Task 9: Build the app shell and navigation

**Files:**
- Create: `src/client/lib/types.ts`
- Create: `src/client/lib/api.ts`
- Create: `src/client/components/BottomNav.tsx`
- Create: `src/client/components/TopStatusBar.tsx`
- Create: `src/client/routes/TodayPage.tsx`
- Create: `src/client/routes/CalendarPage.tsx`
- Create: `src/client/routes/AssetsPage.tsx`
- Create: `src/client/routes/LedgerPage.tsx`
- Modify: `src/client/App.tsx`
- Modify: `src/client/tests/TodayPage.test.tsx`

- [ ] **Step 1: Write the failing frontend shell test**

Add a rendering test that expects the app shell to show four navigation entries:
- Today
- Calendar
- Assets
- Ledger

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/client/tests/TodayPage.test.tsx`
Expected: FAIL because the shell and nav are not wired up

- [ ] **Step 3: Write minimal implementation**

Implement the shell layout, status bar placeholder, bottom navigation, and route-level placeholders.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/client/tests/TodayPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/client/lib/types.ts src/client/lib/api.ts src/client/components/BottomNav.tsx src/client/components/TopStatusBar.tsx src/client/routes/TodayPage.tsx src/client/routes/CalendarPage.tsx src/client/routes/AssetsPage.tsx src/client/routes/LedgerPage.tsx src/client/App.tsx src/client/tests/TodayPage.test.tsx
git commit -m "feat: add app shell and tab navigation"
```

### Task 10: Implement the daily settlement UI

**Files:**
- Create: `src/client/hooks/useAccount.ts`
- Create: `src/client/components/TodaySettlementCard.tsx`
- Create: `src/client/components/SettlementResultModal.tsx`
- Create: `src/client/components/NoviceBanner.tsx`
- Modify: `src/client/routes/TodayPage.tsx`
- Modify: `src/client/tests/TodayPage.test.tsx`

- [ ] **Step 1: Write the failing UI tests**

Add tests for:
- rendering current balance, streak, and shield
- toggling daily items
- submitting settlement
- showing novice banner during novice dates
- switching from input state to result state after successful settlement

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/client/tests/TodayPage.test.tsx`
Expected: FAIL because the daily settlement components are not implemented

- [ ] **Step 3: Write minimal implementation**

Implement the account hook, daily settlement card, novice banner, API submission, result state transition, and modal overlay for milestone feedback.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/client/tests/TodayPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/client/hooks/useAccount.ts src/client/components/TodaySettlementCard.tsx src/client/components/SettlementResultModal.tsx src/client/components/NoviceBanner.tsx src/client/routes/TodayPage.tsx src/client/tests/TodayPage.test.tsx
git commit -m "feat: implement daily settlement experience"
```

## Chunk 5: Calendar, Assets, and Ledger UI

### Task 11: Implement calendar page and day detail drawer

**Files:**
- Create: `src/client/hooks/useReports.ts`
- Create: `src/client/components/BehaviorCalendar.tsx`
- Create: `src/client/components/DayDetailDrawer.tsx`
- Modify: `src/client/routes/CalendarPage.tsx`
- Create: `src/client/tests/CalendarPage.test.tsx`

- [ ] **Step 1: Write the failing calendar tests**

Add tests for:
- rendering month cells with status labels
- showing shield and external markers
- opening the day detail drawer on selection

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/client/tests/CalendarPage.test.tsx`
Expected: FAIL because the calendar page is not implemented

- [ ] **Step 3: Write minimal implementation**

Implement report fetching for calendar data, the month grid, and the day detail drawer.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/client/tests/CalendarPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/client/hooks/useReports.ts src/client/components/BehaviorCalendar.tsx src/client/components/DayDetailDrawer.tsx src/client/routes/CalendarPage.tsx src/client/tests/CalendarPage.test.tsx
git commit -m "feat: add behavioral calendar page"
```

### Task 12: Implement assets page financial reporting

**Files:**
- Create: `src/client/components/BalanceTrendChart.tsx`
- Create: `src/client/components/IncomeBreakdownChart.tsx`
- Modify: `src/client/routes/AssetsPage.tsx`
- Create: `src/client/tests/AssetsPage.test.tsx`

- [ ] **Step 1: Write the failing assets tests**

Add tests for:
- rendering the balance trend area
- rendering the income breakdown area
- showing milestone summary values

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/client/tests/AssetsPage.test.tsx`
Expected: FAIL because the assets page is still a placeholder

- [ ] **Step 3: Write minimal implementation**

Implement simple chart components and bind them to the report payload.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/client/tests/AssetsPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/client/components/BalanceTrendChart.tsx src/client/components/IncomeBreakdownChart.tsx src/client/routes/AssetsPage.tsx src/client/tests/AssetsPage.test.tsx
git commit -m "feat: add financial reports page"
```

### Task 13: Implement ledger page and external adjustment form

**Files:**
- Create: `src/client/components/LedgerList.tsx`
- Create: `src/client/components/ExternalAdjustmentForm.tsx`
- Modify: `src/client/routes/LedgerPage.tsx`
- Create: `src/client/tests/LedgerPage.test.tsx`

- [ ] **Step 1: Write the failing ledger tests**

Add tests for:
- rendering grouped ledger items
- showing distinct event labels
- submitting an external adjustment and refreshing the list

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/client/tests/LedgerPage.test.tsx`
Expected: FAIL because the ledger page is not implemented

- [ ] **Step 3: Write minimal implementation**

Implement the ledger list, event presentation, and external adjustment creation form.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/client/tests/LedgerPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/client/components/LedgerList.tsx src/client/components/ExternalAdjustmentForm.tsx src/client/routes/LedgerPage.tsx src/client/tests/LedgerPage.test.tsx
git commit -m "feat: add ledger and external adjustment flows"
```

## Chunk 6: Polish, Verification, and Delivery

### Task 14: Apply the platform-app visual system and responsive styling

**Files:**
- Modify: `src/client/styles/theme.css`
- Modify: `src/client/styles/app.css`
- Modify: `src/client/components/TopStatusBar.tsx`
- Modify: `src/client/components/TodaySettlementCard.tsx`
- Modify: `src/client/components/SettlementResultModal.tsx`
- Modify: `src/client/components/BehaviorCalendar.tsx`
- Modify: `src/client/components/LedgerList.tsx`

- [ ] **Step 1: Write the failing visual acceptance checklist**

Define a manual checklist:
- mobile-first spacing works at 390px width
- dark platform-app card hierarchy is visible
- today page input and result states are clearly distinct
- charts remain readable on tablet width
- ledger remains scannable on phone width

- [ ] **Step 2: Run the app locally and review the checklist**

Run: `npm run dev`
Expected: identify styling gaps before refinement

- [ ] **Step 3: Write minimal implementation**

Apply theme tokens, typography, spacing, status colors, and lightweight transitions consistent with the approved platform-app style.

- [ ] **Step 4: Re-run manual verification**

Run: `npm run dev`
Expected: checklist items are satisfied on phone and tablet responsive widths

- [ ] **Step 5: Commit**

```bash
git add src/client/styles/theme.css src/client/styles/app.css src/client/components/TopStatusBar.tsx src/client/components/TodaySettlementCard.tsx src/client/components/SettlementResultModal.tsx src/client/components/BehaviorCalendar.tsx src/client/components/LedgerList.tsx
git commit -m "feat: apply platform-app responsive visual system"
```

### Task 15: Run full verification and document operations

**Files:**
- Modify: `package.json`
- Create: `README.md`

- [ ] **Step 1: Add missing verification and maintenance scripts**

Ensure scripts exist for:
- `dev`
- `build`
- `test`
- `test:server`
- `backup:db`

- [ ] **Step 2: Run full verification**

Run: `npm run test`
Expected: PASS

Run: `npm run test:server`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Document local run and backup operations**

Write README sections for:
- install
- run frontend and server
- database location
- backup command
- final liquidation endpoints

- [ ] **Step 4: Run final smoke check**

Run: `npm run dev`
Expected: server starts, frontend loads, and the main four tabs are reachable

- [ ] **Step 5: Commit**

```bash
git add package.json README.md
git commit -m "docs: add runbook and verification scripts"
```

## Notes for Execution

- Keep all settlement math on the server.
- Do not introduce authentication, role systems, or multi-account features in v1.
- Prefer simple charts over heavy charting libraries if native SVG is sufficient.
- Keep animations lightweight and degradable on weak hardware.
- Use SQLite transactions for every operation that changes balance, streak, or shield state.
