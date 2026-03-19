import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LedgerPage } from '../routes/LedgerPage';

describe('LedgerPage', () => {
  it('loads ledger items and creates an external adjustment', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                id: 1,
                eventDate: '2026-03-20',
                eventType: 'DAILY_SETTLEMENT',
                amountDelta: 25,
                reason: null,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            event: { eventType: 'EXTERNAL_ADJUSTMENT' },
            account: { balance: 130 },
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            items: [
              {
                id: 2,
                eventDate: '2026-03-21',
                eventType: 'EXTERNAL_ADJUSTMENT',
                amountDelta: 30,
                reason: 'School reward',
              },
              {
                id: 1,
                eventDate: '2026-03-20',
                eventType: 'DAILY_SETTLEMENT',
                amountDelta: 25,
                reason: null,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );

    render(<LedgerPage />);

    expect(await screen.findByText('每日结算')).toBeInTheDocument();
    await user.type(screen.getByLabelText('金额'), '30');
    await user.type(screen.getByLabelText('事由'), 'School reward');
    await user.selectOptions(screen.getByLabelText('来源'), 'school');
    await user.click(screen.getByRole('button', { name: '新增奖惩' }));

    await waitFor(() => {
      expect(screen.getByText('外部奖惩')).toBeInTheDocument();
      expect(screen.getByText('School reward')).toBeInTheDocument();
    });

    fetchMock.mockRestore();
  });
});
