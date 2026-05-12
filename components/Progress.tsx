'use client';

interface Props { value: number; total: number; accent?: string; height?: number }

export default function Progress({ value, total, accent, height = 6 }: Props) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="fc-progress" style={{ height }}>
      <div className="fc-progress-fill" style={{ width: `${pct}%`, background: accent ?? 'var(--fc-accent)' }} />
    </div>
  );
}
