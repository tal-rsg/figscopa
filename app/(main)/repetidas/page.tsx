'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Search } from 'lucide-react';
import { ALL_STICKERS, COUNTRIES, SPECIALS, STICKER_META, getCountryInfo } from '@/lib/data';
import { useCollection } from '@/contexts/CollectionContext';
import CountryBadge from '@/components/CountryBadge';
import StickerCard from '@/components/StickerCard';
import Stepper from '@/components/Stepper';
import { useToast } from '@/components/Toast';

export default function RepetidasPage() {
  const { collection, setCount } = useCollection();
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState('');

  const groups = useMemo(() => {
    const map: Record<string, { stickerId: string; count: number }[]> = {};
    ALL_STICKERS.forEach(s => {
      const c = collection[s.id] ?? 0;
      if (c <= 1) return;
      if (!map[s.country]) map[s.country] = [];
      map[s.country].push({ stickerId: s.id, count: c });
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [collection]);

  const totalExtras = useMemo(
    () => groups.reduce((acc, [, items]) => acc + items.reduce((a, i) => a + i.count - 1, 0), 0),
    [groups]
  );

  const filtered = useMemo(() => {
    if (!filter) return groups;
    const q = filter.toLowerCase();
    return groups.filter(([code]) => {
      const info = getCountryInfo(code);
      return code.toLowerCase().includes(q) || info?.name.toLowerCase().includes(q);
    });
  }, [groups, filter]);

  function copyList() {
    const lines: string[] = [];
    groups.forEach(([code, items]) => {
      const info = getCountryInfo(code);
      lines.push(`\n${info?.name ?? code} (${code})`);
      items.forEach(({ stickerId, count }) => {
        const meta = STICKER_META[stickerId];
        lines.push(`  ${stickerId} ×${count - 1} — ${meta?.title ?? ''}`);
      });
    });
    navigator.clipboard.writeText(lines.join('\n').trim());
    toast('Lista copiada!', 'success');
  }

  return (
    <div className="fc-screen">
      <div className="fc-rep-hero">
        <div>
          <div className="fc-rep-big-num">{totalExtras}</div>
          <div className="fc-mute" style={{ fontSize: 13, marginTop: 4 }}>figurinhas repetidas no total</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="fc-btn-ghost" onClick={copyList} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Copy size={14} /> Copiar lista
          </button>
        </div>
      </div>

      <div className="fc-toolbar" style={{ marginBottom: 14 }}>
        <div className="fc-search">
          <Search size={14} />
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filtrar por país..." />
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="fc-empty-state">
          {totalExtras === 0 ? 'Nenhuma figurinha repetida ainda.' : 'Nenhum país encontrado com esse filtro.'}
        </div>
      )}

      <div className="fc-rep-groups">
        {filtered.map(([code, items]) => {
          const info = getCountryInfo(code);
          const groupExtras = items.reduce((acc, i) => acc + i.count - 1, 0);
          return (
            <div key={code}>
              <div className="fc-rep-group-head">
                <CountryBadge code={code} size={30} />
                <button style={{ fontWeight: 700, fontSize: 14 }} onClick={() => router.push(`/album/${code}`)}>
                  {info?.name ?? code}
                </button>
                <span className="fc-mute" style={{ marginLeft: 'auto', fontSize: 12 }}>
                  {items.length} tipo{items.length > 1 ? 's' : ''} · {groupExtras} extra{groupExtras > 1 ? 's' : ''}
                </span>
              </div>
              {items.map(({ stickerId, count }) => {
                const sticker = ALL_STICKERS.find(s => s.id === stickerId)!;
                const meta = STICKER_META[stickerId];
                return (
                  <div key={stickerId} className="fc-rep-row">
                    <StickerCard sticker={sticker} count={count} density="compact" onClick={() => router.push(`/album/${code}`)} />
                    <div className="fc-rep-info">
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="fc-chip" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{stickerId}</span>
                        <span className="fc-chip" style={{ background: 'var(--fc-rep-soft)', color: 'var(--fc-rep)' }}>×{count - 1} extras</span>
                      </div>
                      <div style={{ fontSize: 13, marginTop: 4, fontWeight: 600 }}>{meta?.title}</div>
                      {meta?.position && <div style={{ fontSize: 11, color: 'var(--fc-ink-muted)' }}>{meta.position}</div>}
                    </div>
                    <Stepper value={count} onChange={v => setCount(stickerId, v)} max={20} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
