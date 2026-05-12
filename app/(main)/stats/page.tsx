'use client';
import { useEffect, useMemo, useState } from 'react';
import { Query } from 'appwrite';
import { ALL_STICKERS, COUNTRIES, SPECIALS, getCountryTotal, TOTAL_STICKERS } from '@/lib/data';
import { useCollection } from '@/contexts/CollectionContext';
import { getAccount, getDatabases } from '@/lib/appwrite/client';
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import CountryBadge from '@/components/CountryBadge';
import Progress from '@/components/Progress';

type Friend = { id: string; name: string; owned: number };

export default function StatsPage() {
  const { collection } = useCollection();
  const [myId, setMyId] = useState('');
  const [myName, setMyName] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);

  const stats = useMemo(() => {
    let owned = 0, rep = 0, complete = 0;
    ALL_STICKERS.forEach(s => {
      const c = collection[s.id] ?? 0;
      if (c >= 1) owned++;
      if (c >= 2) rep += c - 1;
    });
    [...COUNTRIES, ...SPECIALS].forEach(c => {
      const total = getCountryTotal(c.code);
      let o = 0;
      for (let i = 1; i <= total; i++) if ((collection[`${c.code}${i}`] ?? 0) > 0) o++;
      if (o === total) complete++;
    });
    return { owned, missing: TOTAL_STICKERS - owned, rep, complete };
  }, [collection]);

  const pct = Math.round((stats.owned / TOTAL_STICKERS) * 100);
  const r = 70;
  const circ = 2 * Math.PI * r;
  const dash = circ * (stats.owned / TOTAL_STICKERS);

  const countryStats = useMemo(() =>
    [...COUNTRIES, ...SPECIALS].map(c => {
      const total = getCountryTotal(c.code);
      let owned = 0, rep = 0;
      for (let i = 1; i <= total; i++) {
        const v = collection[`${c.code}${i}`] ?? 0;
        if (v > 0) owned++;
        if (v > 1) rep += v - 1;
      }
      return { code: c.code, name: c.name, owned, total, rep, missing: total - owned };
    }),
  [collection]);

  const topMissing  = useMemo(() => [...countryStats].sort((a, b) => b.missing - a.missing).slice(0, 6), [countryStats]);
  const topRepeated = useMemo(() => [...countryStats].sort((a, b) => b.rep - a.rep).filter(c => c.rep > 0).slice(0, 6), [countryStats]);

  useEffect(() => {
    async function load() {
      const account = getAccount();
      const databases = getDatabases();
      try {
        const user = await account.get();
        setMyId(user.$id);
        setMyName(user.name ?? user.email?.split('@')[0] ?? '');

        const fsRes = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.FRIENDSHIPS, [
          Query.or([Query.equal('user_id', user.$id), Query.equal('friend_id', user.$id)]),
          Query.equal('status', 'accepted'),
          Query.limit(200),
        ]);
        const fIds = (fsRes.documents as unknown as { user_id: string; friend_id: string }[]).map(d =>
          d.user_id === user.$id ? d.friend_id : d.user_id
        );
        if (!fIds.length) return;

        const [profilesRes, colsRes] = await Promise.all([
          databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.PROFILES, [Query.equal('$id', fIds), Query.limit(200)]),
          databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.COLLECTION, [Query.equal('user_id', fIds), Query.limit(5000)]),
        ]);

        const ownedMap: Record<string, number> = {};
        (colsRes.documents as unknown as { user_id: string; count: number }[]).forEach(d => {
          if (d.count > 0) ownedMap[d.user_id] = (ownedMap[d.user_id] ?? 0) + 1;
        });

        setFriends((profilesRes.documents as unknown as { $id: string; name: string }[]).map(p => ({
          id: p.$id, name: p.name, owned: ownedMap[p.$id] ?? 0,
        })));
      } catch {}
    }
    load();
  }, []);

  const ranking = useMemo(() => {
    const all = [{ id: myId, name: myName, owned: stats.owned, isMe: true }, ...friends.map(f => ({ ...f, isMe: false }))];
    return all.sort((a, b) => b.owned - a.owned);
  }, [myId, myName, stats.owned, friends]);

  const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fc-screen">
      <div className="fc-stats-hero">
        <svg width={160} height={160} viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={r} fill="none" stroke="var(--fc-line)" strokeWidth="12" />
          <circle cx="80" cy="80" r={r} fill="none" stroke="var(--fc-accent)" strokeWidth="12"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 80 80)" />
          <text x="80" y="80" textAnchor="middle" dominantBaseline="central" fontSize="28" fontWeight="800" fill="var(--fc-ink)">{pct}%</text>
        </svg>
        <div className="fc-stats-numbers">
          {[
            { label: 'Coladas',   value: stats.owned    },
            { label: 'Faltando',  value: stats.missing  },
            { label: 'Repetidas', value: stats.rep      },
            { label: 'Completas', value: stats.complete },
          ].map(({ label, value }) => (
            <div key={label} className="fc-stat">
              <div className="fc-stat-num">{value}</div>
              <div className="fc-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="fc-stats-cols">
        <div className="fc-card">
          <h3>Ranking de amigos</h3>
          {ranking.length <= 1 && <div className="fc-mute" style={{ fontSize: 13 }}>Adicione amigos para ver o ranking.</div>}
          <div className="fc-rank-list">
            {ranking.map((r, i) => (
              <div key={r.id || i} className={`fc-rank-row ${r.isMe ? 'is-me' : ''}`}>
                <span className="fc-rank-pos">#{i + 1}</span>
                <div className="fc-avatar fc-avatar-sm">{initials(r.name)}</div>
                <span>{r.name}{r.isMe ? ' (você)' : ''}</span>
                <Progress value={r.owned} total={TOTAL_STICKERS} height={6} />
                <span className="fc-rank-num">{r.owned}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="fc-card">
          <h3>Mais faltando</h3>
          <div className="fc-mini-list">
            {topMissing.map(c => (
              <div key={c.code} className="fc-mini-row">
                <CountryBadge code={c.code} size={22} />
                <span className="fc-mini-name">{c.name}</span>
                <span className="fc-mini-num" style={{ color: 'var(--fc-rep)' }}>{c.missing}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="fc-card">
          <h3>Mais repetidas</h3>
          {topRepeated.length === 0 && <div className="fc-mute" style={{ fontSize: 13 }}>Nenhuma repetida ainda.</div>}
          <div className="fc-mini-list">
            {topRepeated.map(c => (
              <div key={c.code} className="fc-mini-row">
                <CountryBadge code={c.code} size={22} />
                <span className="fc-mini-name">{c.name}</span>
                <span className="fc-mini-num" style={{ color: 'var(--fc-ok)' }}>{c.rep}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
