'use client';
import { COUNTRIES, SPECIALS, badgeColor } from '@/lib/data';

interface Props { code: string; size?: number }

export default function CountryBadge({ code, size = 40 }: Props) {
  const country = COUNTRIES.find(c => c.code === code);
  if (!country) {
    const special = SPECIALS.find(s => s.code === code);
    return (
      <div className="fc-badge" style={{ width: size, height: size, background: special?.accent ?? '#888', color: '#fff', fontSize: size * 0.32 }}>
        {code}
      </div>
    );
  }
  const { bg, fg } = badgeColor(code);
  return (
    <div className="fc-badge" style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.34 }}>
      {code}
    </div>
  );
}
