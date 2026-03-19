import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as dateLib from '../lib/date';
import { TodayPage } from '../routes/TodayPage';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TodayPage', () => {
  it('loads and shows the current account summary', async () => {
    vi.spyOn(dateLib, 'getTodayDateString').mockReturnValue('2026-03-20');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
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

    render(<TodayPage />);

    expect(await screen.findByText('余额')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('连胜')).toBeInTheDocument();
    expect(screen.getByText('护盾')).toBeInTheDocument();
    expect(
      screen.getByText('新手保护期进行中：只要不是等级 3，今天都按 +25 计算。'),
    ).toBeInTheDocument();

    fetchMock.mockRestore();
  });

  it('submits a successful settlement and shows the result state', async () => {
    const user = userEvent.setup();
    vi.spyOn(dateLib, 'getTodayDateString').mockReturnValue('2026-03-19');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
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
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            level: 1,
            amountDelta: 25,
            account: {
              accountId: 'primary',
              balance: 125,
              streakCount: 1,
              shieldStock: 0,
              lastSettlementDate: '2026-03-20',
            },
            events: [{ eventType: 'DAILY_SETTLEMENT', amountDelta: 25 }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );

    render(<TodayPage />);

    await screen.findByText('余额');
    await user.click(screen.getByRole('button', { name: '起航' }));
    await user.click(screen.getByRole('button', { name: '背景音' }));
    await user.click(screen.getByRole('button', { name: '燃料' }));
    await user.click(screen.getByRole('button', { name: '环境' }));
    await user.click(screen.getByRole('button', { name: '立即结算' }));

    await waitFor(() => {
      expect(screen.getByText('结算结果')).toBeInTheDocument();
      expect(screen.getByText('等级 1')).toBeInTheDocument();
      expect(screen.getByText('+25')).toBeInTheDocument();
      expect(screen.getByText('当前余额 125')).toBeInTheDocument();
      expect(screen.getByText('四项全部完成，连胜 +1。')).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/settlement',
      expect.objectContaining({
        body: JSON.stringify({
          eventDate: '2026-03-19',
          missedItems: [],
          severeViolation: false,
          consumeShield: false,
          note: null,
        }),
      }),
    );

    fetchMock.mockRestore();
  });

  it('submits level 3 when severe violation is selected', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            account: {
              accountId: 'primary',
              balance: 140,
              streakCount: 4,
              shieldStock: 1,
              lastSettlementDate: null,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            level: 3,
            amountDelta: -50,
            account: {
              accountId: 'primary',
              balance: 90,
              streakCount: 0,
              shieldStock: 1,
              lastSettlementDate: '2026-03-19',
            },
            events: [{ eventType: 'DAILY_SETTLEMENT', amountDelta: -50 }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );

    render(<TodayPage />);

    await screen.findByText('余额');
    expect(screen.getByText('严重违规 / 熔断')).toBeInTheDocument();
    expect(
      screen.getByText(
        '用于一票否决的严重违规情况，将直接按等级 3 结算并清零连胜。',
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '启用熔断' }));
    await user.click(screen.getByRole('button', { name: '立即结算' }));

    await waitFor(() => {
      expect(screen.getByText('等级 3')).toBeInTheDocument();
      expect(screen.getByText('-50')).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/settlement',
      expect.objectContaining({
        body: expect.stringContaining('"severeViolation":true'),
      }),
    );

    fetchMock.mockRestore();
  });

  it('asks before consuming a shield for level 2 settlement', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            account: {
              accountId: 'primary',
              balance: 140,
              streakCount: 5,
              shieldStock: 1,
              lastSettlementDate: null,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            level: 2,
            amountDelta: 15,
            account: {
              accountId: 'primary',
              balance: 155,
              streakCount: 5,
              shieldStock: 0,
              lastSettlementDate: '2026-03-19',
            },
            events: [
              { eventType: 'DAILY_SETTLEMENT', amountDelta: 15 },
              { eventType: 'SHIELD_CONSUMED', amountDelta: 0 },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );

    render(<TodayPage />);

    await screen.findByText('余额');
    await user.click(screen.getByRole('button', { name: '起航' }));
    await user.click(screen.getByRole('button', { name: '背景音' }));
    await user.click(screen.getByRole('button', { name: '燃料' }));
    await user.click(screen.getByRole('button', { name: '立即结算' }));

    expect(screen.getByText('是否消耗 1 个护盾保住连胜？')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '消耗护盾并结算' }));

    await waitFor(() => {
      expect(screen.getByText('等级 2')).toBeInTheDocument();
      expect(screen.getByText('+15')).toBeInTheDocument();
      expect(screen.getByText('未完成 1 项，已消耗护盾，连胜保留。')).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/settlement',
      expect.objectContaining({
        body: expect.stringContaining('"consumeShield":true'),
      }),
    );

    fetchMock.mockRestore();
  });

  it('shows milestone rewards in the result panel', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            account: {
              accountId: 'primary',
              balance: 200,
              streakCount: 2,
              shieldStock: 0,
              lastSettlementDate: null,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            level: 1,
            amountDelta: 25,
            account: {
              accountId: 'primary',
              balance: 245,
              streakCount: 3,
              shieldStock: 0,
              lastSettlementDate: '2026-03-19',
            },
            events: [
              { eventType: 'DAILY_SETTLEMENT', amountDelta: 25 },
              { eventType: 'STREAK_REWARD', amountDelta: 20 },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );

    render(<TodayPage />);

    await screen.findByText('余额');
    await user.click(screen.getByRole('button', { name: '起航' }));
    await user.click(screen.getByRole('button', { name: '背景音' }));
    await user.click(screen.getByRole('button', { name: '燃料' }));
    await user.click(screen.getByRole('button', { name: '环境' }));
    await user.click(screen.getByRole('button', { name: '立即结算' }));

    await waitFor(() => {
      expect(screen.getByText('里程碑奖励')).toBeInTheDocument();
      expect(screen.getByText('3 天奖励 +20')).toBeInTheDocument();
    });

    fetchMock.mockRestore();
  });

  it('keeps the account state and shows an error when settlement fails', async () => {
    const user = userEvent.setup();
    vi.spyOn(dateLib, 'getTodayDateString').mockReturnValue('2026-03-20');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            account: {
              accountId: 'primary',
              balance: 245,
              streakCount: 3,
              shieldStock: 0,
              lastSettlementDate: '2026-03-19',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: 'Unknown settlement error',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        ),
      );

    render(<TodayPage />);

    await screen.findByText('余额');
    await user.click(screen.getByRole('button', { name: '起航' }));
    await user.click(screen.getByRole('button', { name: '背景音' }));
    await user.click(screen.getByRole('button', { name: '燃料' }));
    await user.click(screen.getByRole('button', { name: '环境' }));
    await user.click(screen.getByRole('button', { name: '立即结算' }));

    await waitFor(() => {
      expect(screen.getByText('Unknown settlement error')).toBeInTheDocument();
    });

    expect(screen.getByText('245')).toBeInTheDocument();
    expect(screen.queryByText('加载中')).not.toBeInTheDocument();

    fetchMock.mockRestore();
  });

  it('does not allow settling again when today is already settled', async () => {
    vi.spyOn(dateLib, 'getTodayDateString').mockReturnValue('2026-03-19');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          account: {
            accountId: 'primary',
            balance: 245,
            streakCount: 3,
            shieldStock: 0,
            lastSettlementDate: '2026-03-19',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    render(<TodayPage />);

    expect(await screen.findByText('今日已经结算完成。')).toBeInTheDocument();
    expect(screen.getByText('请明天再进行新的结算。')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '立即结算' })).not.toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    fetchMock.mockRestore();
  });
});
