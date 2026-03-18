# EBS Design

## Overview

EBS (Elite Boarding-student System) is a browser-based system for a single family to jointly operate without login. The product runs as a mobile-first web app backed by a server and SQLite storage with periodic database-file backups.

The core goal is to make cause and effect visible: daily behavior maps directly to rewards, streaks, shields, and long-term balance growth. The product should use a familiar platform-app interaction style for the daily flow while still supporting weekly and monthly retrospective review.

## Scope

### In Scope

- Single-family, single-account usage
- No login or role separation in v1
- Mobile-first UI, tablet-compatible
- Daily settlement with rule-based rewards and penalties
- Streak rewards and shield mechanics
- Behavioral calendar
- Financial analytics
- Event ledger for daily settlement and external adjustments
- Final liquidation preview and execution on 2026-07-31

### Out of Scope

- Multi-user authentication
- Multi-child account switching
- Push notifications
- Advanced rule customization
- Admin-managed media assets
- PDF or spreadsheet export

## Product Structure

The app is organized around four core areas.

### Today

This is the primary entry point and the only page optimized for the daily core action. It displays current balance, streak count, shield stock, and whether today has already been settled.

If not yet settled, the page centers on the daily action panel:

- Four large completion toggles: launch, background sound, fuel, environment
- One separate severe-violation toggle for level 3 cutoff
- One primary action button to confirm settlement

If already settled, the panel changes into a result card showing:

- Final level for the day
- Amount gained or lost
- Milestone reward if triggered
- A short cause-and-effect explanation

The page should behave like two clearly different visual states rather than one static layout with replaced text:

- Before settlement: input-focused daily settlement panel
- After settlement: result-focused summary state

The post-settlement state should visibly recompose the page around the result so the user feels a clear transition from "input" to "outcome."

### Calendar

A monthly behavioral calendar shows each day as a colored status tile:

- Green: level 1
- Yellow: level 2
- Red: level 3

Tapping a day opens a detail drawer containing missed items, final grade, amount change, shield change, admin note, and any external adjustments tied to that date.

Each day tile should also support lightweight symbols in addition to color alone:

- `S`, `A`, or `F` micro-label
- Shield-spent marker when applicable
- External-adjustment corner marker when applicable

This reduces reliance on color and makes the calendar more readable during retrospective review.

### Assets

This area supports retrospective review. It contains:

- Balance growth trend from 2026-03-20 onward
- Income composition visualization
- Current balance breakdown
- Milestone summary

The page should frame behavior stability as visible long-term asset growth.

This page should use a clear financial-report style rather than thematic packaging:

- Growth line as balance trend
- Composition chart as income-source breakdown
- Milestones as supporting account summary

### Ledger

This page lists all account-affecting events in reverse chronological order. It includes daily settlement, streak rewards, shield gains and spending, external adjustments, and final liquidation events. External adjustments are created here as standalone events.

Ledger items should not all share the same visual treatment. Distinct event categories should have different labels, icons, and accent framing so the list stays scannable on mobile.

## Visual Direction

The approved visual direction is a generic gaming-platform app style with a two-core emotional model:

- Primary emotional loop: clear daily completion and immediate result feedback
- Secondary emotional loop: long-term asset building and retrospective review

The homepage should feel like a clean platform app result surface. The analytics pages should feel like clear financial and behavior reporting pages. This avoids losing the educational value behind overly thematic presentation.

### Visual Theme Anchor

The product should use a familiar generic gaming-platform app style rather than a strong fictional theme.

This implies:

- Dark interface surfaces with restrained accent colors
- Clear card hierarchy with one dominant primary panel on the home screen
- Large result badge treatment for the daily level and amount change
- Supportive top-line status display for balance, streak, and shield
- Light motion and feedback layers without world-building or heavy role-play styling

The memorable impression should be "a polished platform app for daily progress tracking" rather than a themed game world.

## Core Business Rules

### Cycle

- Active period: 2026-03-20 through 2026-07-31
- Initial balance: 100.00

### Daily Settlement

The system settles one day at a time and must reject duplicate settlement for the same date.

#### Level 1

Condition:

- All four daily items are completed

Effect:

- `+25`
- `streak_count +1`

#### Level 2

Condition:

- At least one daily item is not completed
- No severe violation cutoff is selected

Effect outside the novice protection window:

- `+15`

Shield behavior:

- If shield stock is greater than zero, the user is asked whether to spend one shield to preserve the current streak
- If the shield is spent, create a shield-consumed event and keep the streak alive
- If the shield is not spent, streak ends

#### Level 3

Condition:

- Severe violation cutoff is selected

Effect:

- `-50`
- `streak_count = 0`

### Novice Protection Window

The novice protection window applies from 2026-03-20 through 2026-03-22 inclusive.

Rules during this window:

- Level 1 remains `+25`
- Level 2 is temporarily raised to `+25`
- Level 3 remains `-50`

This means any result other than level 3 earns `+25` during the first three days.

This period should also be represented as an onboarding phase in the interface:

- Show a visible novice-protection banner on the home screen
- Explain in simple language that any result other than level 3 earns `+25`
- On the first day after the window ends, show a transition message indicating that formal season rules are now active

### Streak Rewards

The backend evaluates milestone rewards immediately after successful daily settlement.

- 3 days: `+20`
- 7 days: `+50`
- 14 days: grant `1 shield`
- 21 days: `+200`, then reset streak count

### External Adjustments

School or outside rewards and penalties are stored as standalone ledger events. They do not rewrite past daily settlement results.

Each external adjustment records:

- Effective date
- Positive or negative amount
- Reason
- Source
- Optional note

### Final Liquidation

On 2026-07-31, the system computes final liquidation as:

`final_balance = balance + (shield_stock * 30)`

The product should support a preview state before final confirmation so the account is not closed accidentally.

## Data Model

The system uses a dual-layer model: account snapshot plus event ledger.

### Account Snapshot

This stores the latest operational state:

- `account_id`
- `balance`
- `streak_count`
- `shield_stock`
- `last_settlement_date`

Although v1 exposes only one account, `account_id` should remain in the schema so future expansion does not require a structural rewrite.

### Event Ledger

Every money or state change is represented as a durable event record. Suggested event types:

- `DAILY_SETTLEMENT`
- `STREAK_REWARD`
- `SHIELD_GRANTED`
- `SHIELD_CONSUMED`
- `EXTERNAL_ADJUSTMENT`
- `FINAL_LIQUIDATION`

Each event should store enough detail to reproduce reports and explain why a change occurred.

Recommended fields:

- `id`
- `account_id`
- `event_date`
- `event_type`
- `amount_delta`
- `balance_after`
- `streak_after`
- `shield_after`
- `level`
- `missed_items`
- `reason`
- `source`
- `note`
- `metadata_json`
- `created_at`

## UX and Interaction

### Today Flow

The daily flow should be single-step confirmation, not a multi-page wizard.

Flow:

1. User selects the four daily completion items and optional severe violation toggle
2. User taps confirm
3. Frontend sends a settlement request to the server
4. Server computes results and commits all related events transactionally
5. Frontend displays the returned result state and animation

### Result Presentation

After settlement, the result card should make causality explicit in plain language. Examples:

- "All four targets completed. Streak +1."
- "One target missed. Shield not used. Streak interrupted."
- "Milestone reached: 7-day streak reward unlocked."

The page composition should have one dominant visual memory point:

- The daily grade badge or rank plate should occupy the strongest visual position on screen

Balance, streak, and shield should act as supporting status elements rather than competing primary cards.

### Animation Strategy

- Level 1: coin burst, 1.5 to 2 seconds, optional sound toggle
- 3, 7, and 21 day milestones: full-screen confetti and badge reveal
- 14 day milestone: shield charging and inventory arrival animation
- Level 3: strong but restrained red cutoff feedback, avoiding humiliating or overly punishing treatment

Animations must support explicit performance tiers because the product may run on weak hardware:

- `full`: full particle and celebratory effects
- `lite`: simplified motion with fewer particles and shorter duration
- `off`: static visual feedback without heavy animation

The client should default to a conservative mode on low-end devices or when performance drops are detected.

### Tone and Feedback Copy

The microcopy should follow a consistent emotional rule set:

- Success: proud, energetic, reward-focused
- Mistakes: calm, factual, non-shaming
- Review: explanatory and causal, never moralizing

The system should communicate "this choice produced this outcome" instead of assigning moral judgment.

### Mobile Interaction Principles

- Large tap targets instead of small checkboxes
- Bottom drawer for day detail on calendar
- Card-based ledger instead of dense desktop-style tables
- Clear primary action hierarchy on the home screen

## Technical Architecture

### Stack Shape

- Browser client
- Server-side application layer
- SQLite database
- Scheduled SQLite file backup

SQLite is preferred because it is lightweight, operationally simple, and sufficient for a low-concurrency single-family system while still providing transactions and query support for reporting.

### Backend Responsibility

All financial, streak, shield, and milestone calculations must happen on the server. The frontend is responsible only for data entry and display. This prevents logic drift and preserves report integrity.

### Consistency Requirements

- Prevent duplicate settlement for the same date
- Use transactional writes so settlement and reward events succeed or fail together
- Do not play success animations before the server confirms commit
- Allow historical external adjustments without rewriting past settlement records

## Reporting Requirements

### Behavioral Calendar

- Monthly view
- Day color reflects final level
- Day detail shows missed items and notes

### Financial Analytics

- Balance growth line chart from 2026-03-20 to current date
- Composition chart for income categories

Suggested category buckets:

- Base daily rewards
- Streak milestone rewards
- External adjustments

If shield conversion at final liquidation is shown in analytics, it should appear as a separate category instead of being mixed into normal earnings.

### Daily Logs

The detailed ledger view should expose:

- Date
- Final level
- Amount change
- Shield change
- Admin note
- External adjustments

## Error Handling

- If network submission fails, show the day as unsaved and do not assume settlement succeeded
- If the backend detects duplicate settlement, return a clear conflict response
- If part of reward processing fails, roll back the full transaction
- If final liquidation has already been executed, reject repeated execution unless an explicit reversal workflow exists

## Testing Strategy

The implementation plan must include automated coverage for:

- Level 1 settlement
- Level 2 settlement outside novice window
- Level 2 settlement during novice window
- Level 2 with shield usage
- Level 2 without shield usage
- Level 3 cutoff
- 3, 7, 14, and 21 day milestones
- Streak reset after 21 day reward
- Duplicate same-day settlement protection
- Historical external adjustment creation
- Final liquidation formula

## Open Implementation Notes

- Because this product may run on a weak machine, animations should degrade gracefully on low-end devices
- Audio should be optional and easy to mute
- Backups should be simple file-level backups of the SQLite database with retention policy defined during implementation planning

## Recommended Build Order

1. Core settlement engine and SQLite schema
2. Today page and result feedback
3. Ledger and external adjustments
4. Calendar and day details
5. Asset analytics
6. Final liquidation flow
7. Animation polish
