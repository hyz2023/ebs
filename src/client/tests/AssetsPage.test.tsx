import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AssetsPage } from '../routes/AssetsPage';

describe('AssetsPage', () => {
  it('renders balance points and income breakdown', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            balancePoints: [
              { eventDate: '2026-03-20', balance: 125 },
              { eventDate: '2026-03-21', balance: 140 },
            ],
            incomeBreakdown: [
              { key: 'base_rewards', amount: 50 },
              { key: 'streak_rewards', amount: 0 },
              { key: 'external_adjustments', amount: -10 },
            ],
            milestoneSummary: { shieldGrants: 1 },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            preview: {
              eventDate: '2026-07-31',
              balance: 140,
              shieldStock: 2,
              shieldConversion: 60,
              finalBalance: 200,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            preview: {
              eventDate: '2026-07-31',
              balance: 140,
              shieldStock: 2,
              shieldConversion: 60,
              finalBalance: 200,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );

    render(<AssetsPage />);

    expect(await screen.findByText('余额走势')).toBeInTheDocument();
    expect(screen.getByText('2026-03-21')).toBeInTheDocument();
    expect(screen.getByText('140')).toBeInTheDocument();
    expect(screen.getByText('基础分')).toBeInTheDocument();
    expect(screen.getByText('-10')).toBeInTheDocument();
    expect(await screen.findByText('最终结算预览')).toBeInTheDocument();
    expect(screen.getByText('护盾折算：60')).toBeInTheDocument();
    expect(screen.getByText('预计总额：200')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '执行最终结算' }));

    await waitFor(() => {
      expect(screen.getByText('最终结算已执行。')).toBeInTheDocument();
    });

    fetchMock.mockRestore();
  });
});
