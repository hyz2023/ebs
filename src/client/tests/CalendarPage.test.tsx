import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { CalendarPage } from '../routes/CalendarPage';

describe('CalendarPage', () => {
  it('renders day cells and opens a day detail panel', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          days: [
            {
              date: '2026-03-20',
              level: 1,
              usedShield: false,
              hasExternalAdjustment: false,
              note: null,
            },
            {
              date: '2026-03-21',
              level: 2,
              usedShield: true,
              hasExternalAdjustment: true,
              note: 'Missed one item',
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    render(<CalendarPage />);

    expect(await screen.findByRole('button', { name: /2026-03-20/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /2026-03-21/i }));

    expect(screen.getByText('当日详情')).toBeInTheDocument();
    expect(screen.getAllByText('2026-03-21')).toHaveLength(2);
    expect(screen.getByText('Missed one item')).toBeInTheDocument();

    fetchMock.mockRestore();
  });
});
