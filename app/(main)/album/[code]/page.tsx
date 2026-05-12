'use client';
import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getCountryInfo, getCountryStickers, STICKER_META } from '@/lib/data';
import { useCollection } from '@/contexts/CollectionContext';
import CountryBadge from '@/components/CountryBadge';
import StickerCard from '@/components/StickerCard';
import Stepper from '@/components/Stepper';
import Progress from '@/components/Progress';
import Modal from '@/components/Modal';
import type { Sticker } from '@/lib/data';

export default function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { collection, setCount } = useCollection();
  const country = getCountryInfo(code);
  const stickers = useMemo(() => getCountryStickers(code), [code]);
  const [selected, setSelected] = useState<Sticker | null>(null);

  if (!country) return <div className="fc-empty-state">País não encontrado.</div>;

  let owned = 0, rep = 0;
  stickers.forEach(s => {
    const c = collection[s.id] ?? 0;
    if (c > 0) owned++;
    if (c > 1) rep += c - 1;
  });
  const total = stickers.length;

  function markAll() { stickers.forEach(s => setCount(s.id, 1)); }
  function clearAll() { stickers.forEach(s => setCount(s.id, 0)); }

  return (
    <div className="fc-screen">
      <button className="fc-back" onClick={() => router.back()}>
        <ChevronLeft size={14} /> Voltar ao álbum
      </button>

      <div className="fc-country-hero">
        <CountryBadge code={code} size={64} />
        <div className="fc-country-hero-body">
          <h1>{country.name}</h1>
          <div className="fc-country-hero-meta">
            <span>{owned}/{total} figurinhas</span>
            {rep > 0 && <span className="fc-rep-tag">{rep} repetidas</span>}
            {'group' in country && country.group && <span className="fc-mute">Grupo {country.group}</span>}
          </div>
          <Progress value={owned} total={total} height={8} />
        </div>
      </div>

      <div className="fc-page-toolbar">
        <span className="fc-mute">Toque numa figurinha para marcar. Repetidas? Use o + para somar.</span>
        <div className="fc-quick-actions">
          <button className="fc-btn-ghost" onClick={markAll}>Marcar página toda</button>
          <button className="fc-btn-ghost" onClick={clearAll}>Limpar</button>
        </div>
      </div>

      <div className="fc-sticker-grid">
        {stickers.map(s => {
          const c = collection[s.id] ?? 0;
          return (
            <div key={s.id} className="fc-sticker-cell">
              <StickerCard sticker={s} count={c} onClick={() => setSelected(s)} />
              <div className="fc-cell-controls">
                <Stepper value={c} onChange={v => setCount(s.id, v)} max={20} />
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (() => {
          const meta = STICKER_META[selected.id] ?? {};
          const c = collection[selected.id] ?? 0;
          return (
            <>
              <div className="fc-modal-head">
                <div>
                  <div className="fc-modal-code">{selected.id}</div>
                  <h2>{meta.title ?? 'Figurinha'}</h2>
                </div>
                <button className="fc-x" onClick={() => setSelected(null)}>×</button>
              </div>
              <div className="fc-modal-preview">
                <StickerCard sticker={selected} count={c} density="spacious" onClick={() => {}} />
              </div>
              <div className="fc-modal-meta">
                {meta.position && <div><span className="fc-mute">Posição:</span> {meta.position}</div>}
                {meta.age && <div><span className="fc-mute">Idade:</span> {meta.age} anos</div>}
                <div><span className="fc-mute">País:</span> {country.name}</div>
              </div>
              <div className="fc-modal-actions">
                <span className="fc-mute">Quantas você tem?</span>
                <Stepper value={c} onChange={v => setCount(selected.id, v)} max={20} />
              </div>
            </>
          );
        })()}
      </Modal>
    </div>
  );
}
