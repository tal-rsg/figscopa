'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { COUNTRIES, SPECIALS, getCountryTotal } from '@/lib/data';
import { useCollection } from '@/contexts/CollectionContext';
import CountryBadge from '@/components/CountryBadge';
import Progress from '@/components/Progress';

type Tab = 'teams' | 'special';
type Filter = 'all' | 'missing' | 'complete' | 'repeated';

export default function AlbumPage() {
  const { collection } = useCollection();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('teams');
  const [filter, setFilter] = useState('');
  const [groupBy, setGroupBy] = useState<Filter>('all');

  const stats = useMemo(() => {
    const out: Record<string, { owned: number; total: number; rep: number; complete: boolean }> = {};
    [...COUNTRIES, ...SPECIALS].forEach(c => {
      const total = getCountryTotal(c.code);
      let owned = 0, rep = 0;
      for (let i = 1; i <= total; i++) {
        const v = collection[`${c.code}${i}`] ?? 0;
        if (v > 0) owned++;
        if (v > 1) rep += v - 1;
      }
      out[c.code] = { owned, total, rep, complete: owned === total };
    });
    return out;
  }, [collection]);

  const list = useMemo(() => {
    const source = tab === 'teams' ? COUNTRIES : SPECIALS;
    return source.filter(c => {
      const s = stats[c.code];
      if (groupBy === 'missing'  && s.complete) return false;
      if (groupBy === 'complete' && !s.complete) return false;
      if (groupBy === 'repeated' && s.rep === 0) return false;
      if (filter) {
        const q = filter.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [stats, tab, filter, groupBy]);

  return (
    <div className="fc-screen">
      <div className="fc-toolbar">
        <div className="fc-tabs">
          <button className={tab === 'teams' ? 'is-active' : ''} onClick={() => setTab('teams')}>
            Seleções <span className="fc-tab-count">48</span>
          </button>
          <button className={tab === 'special' ? 'is-active' : ''} onClick={() => setTab('special')}>
            Especiais <span className="fc-tab-count">{SPECIALS.length}</span>
          </button>
        </div>
        <div className="fc-toolbar-right">
          <div className="fc-search">
            <Search size={14} />
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Buscar país ou código..." />
          </div>
          <select value={groupBy} onChange={e => setGroupBy(e.target.value as Filter)} className="fc-select">
            <option value="all">Todos</option>
            <option value="missing">Incompletos</option>
            <option value="complete">Completos</option>
            <option value="repeated">Com repetidas</option>
          </select>
        </div>
      </div>

      <div className="fc-album-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {list.map(c => {
          const s = stats[c.code];
          return (
            <button key={c.code} className={`fc-country-card ${s.complete ? 'is-complete' : ''}`} onClick={() => router.push(`/album/${c.code}`)}>
              <div className="fc-country-head">
                <CountryBadge code={c.code} size={36} />
                {s.rep > 0 && <span className="fc-rep-tag">{s.rep} rep</span>}
                {s.complete && <span className="fc-check">✓</span>}
              </div>
              <div className="fc-country-name">{c.name}</div>
              <div className="fc-country-meta">
                <span>{s.owned}/{s.total}</span>
                <span className="fc-mute">{'group' in c ? `Grupo ${c.group}` : 'Especial'}</span>
              </div>
              <Progress value={s.owned} total={s.total} />
            </button>
          );
        })}
        {list.length === 0 && <div className="fc-empty-state">Nenhum país encontrado com esses filtros.</div>}
      </div>
    </div>
  );
}
