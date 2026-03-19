import { useState } from 'react';

export function ExternalAdjustmentForm({
  onCreated,
}: {
  onCreated: () => Promise<void> | void;
}) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [source, setSource] = useState('school');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await fetch('/api/adjustments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventDate: '2026-03-21',
        amountDelta: Number(amount),
        reason,
        source,
        note: null,
      }),
    });

    setAmount('');
    setReason('');
    await onCreated();
  }

  return (
    <form className="placeholder-block" onSubmit={handleSubmit}>
      <h2>新增外部奖惩</h2>
      <label className="field">
        <span>金额</span>
        <input value={amount} onChange={(event) => setAmount(event.target.value)} />
      </label>
      <label className="field">
        <span>事由</span>
        <input value={reason} onChange={(event) => setReason(event.target.value)} />
      </label>
      <label className="field">
        <span>来源</span>
        <select value={source} onChange={(event) => setSource(event.target.value)}>
          <option value="school">school</option>
          <option value="outside">outside</option>
          <option value="system">system</option>
        </select>
      </label>
      <button className="primary-button" type="submit">
        新增奖惩
      </button>
    </form>
  );
}
