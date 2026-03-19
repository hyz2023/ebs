import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import App from '../App';

describe('App', () => {
  it('renders the Chinese shell heading and core navigation', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          account: {
            accountId: 'primary',
            balance: 100,
            streakCount: 0,
            shieldStock: 0,
            lastSettlementDate: null,
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    render(<App />);

    expect(screen.getByRole('heading', { name: 'EBS' })).toBeInTheDocument();
    expect(screen.getByText('精英住校生系统')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '主导航' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '今日' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '日历' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '资产' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '流水' })).toBeInTheDocument();
    expect(await screen.findByText('余额')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '账户状态' })).toBeInTheDocument();

    fetchMock.mockRestore();
  });
});
