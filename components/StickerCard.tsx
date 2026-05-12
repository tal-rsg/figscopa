'use client';
import { Sticker, STICKER_META, stickerBg } from '@/lib/data';

type Density = 'compact' | 'normal' | 'spacious';

interface Props {
  sticker: Sticker;
  count?: number;
  density?: Density;
  onClick?: () => void;
}

const DIMS: Record<Density, { w: number; h: number; pad: number; codeSize: number; titleSize: number }> = {
  compact:  { w: 84,  h: 116, pad: 8,  codeSize: 9,  titleSize: 9  },
  normal:   { w: 112, h: 156, pad: 10, codeSize: 10, titleSize: 11 },
  spacious: { w: 140, h: 196, pad: 12, codeSize: 11, titleSize: 12 },
};

export default function StickerCard({ sticker, count = 0, density = 'normal', onClick }: Props) {
  const meta = STICKER_META[sticker.id] ?? {};
  const owned = count > 0;
  const repeated = count > 1;
  const d = DIMS[density];
  const { bg, fg } = owned ? stickerBg(sticker.country) : { bg: 'var(--fc-card-empty)', fg: 'var(--fc-ink-muted)' };

  return (
    <button
      className={`fc-sticker ${owned ? 'is-owned' : 'is-empty'} ${repeated ? 'is-repeated' : ''}`}
      style={{ width: d.w, height: d.h, padding: d.pad, background: bg, color: fg }}
      onClick={onClick}
      aria-label={`${sticker.id} ${meta.title ?? ''}`}
    >
      {!owned && (
        <div className="fc-empty-overlay">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5">
            <rect x="4" y="4" width="16" height="16" rx="2" strokeDasharray="3 3" />
          </svg>
        </div>
      )}
      {owned && meta.kind === 'player' && (
        <div className="fc-sticker-portrait">
          <svg viewBox="0 0 40 40" width="100%" height="100%">
            <circle cx="20" cy="16" r="7" fill="currentColor" opacity="0.25" />
            <path d="M5 38 C 5 27, 35 27, 35 38" fill="currentColor" opacity="0.25" />
          </svg>
        </div>
      )}
      {owned && meta.kind === 'team' && (
        <div className="fc-sticker-portrait">
          <svg viewBox="0 0 40 40" width="100%" height="100%">
            <path d="M20 4 L34 10 L34 22 C 34 30, 28 35, 20 38 C 12 35, 6 30, 6 22 L 6 10 Z" fill="currentColor" opacity="0.22" />
          </svg>
        </div>
      )}
      {owned && (meta.kind === 'special' || meta.kind === 'city') && (
        <div className="fc-sticker-portrait">
          <svg viewBox="0 0 40 40" width="100%" height="100%">
            <rect x="8" y="12" width="24" height="20" fill="currentColor" opacity="0.22" rx="1" />
            <rect x="14" y="6" width="12" height="8" fill="currentColor" opacity="0.22" rx="1" />
          </svg>
        </div>
      )}
      <div className="fc-sticker-code" style={{ fontSize: d.codeSize }}>{sticker.id}</div>
      <div className="fc-sticker-title" style={{ fontSize: d.titleSize }} title={meta.title}>{meta.title ?? ''}</div>
      {meta.position && meta.kind === 'player' && (
        <div className="fc-sticker-pos" style={{ fontSize: d.codeSize - 1 }}>{meta.position}</div>
      )}
      {repeated && <div className="fc-rep-pill" aria-label={`${count} cópias`}>×{count}</div>}
    </button>
  );
}
