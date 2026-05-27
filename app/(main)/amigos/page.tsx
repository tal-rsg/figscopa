'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, MessageCircle } from 'lucide-react';
import { Query, ID } from 'appwrite';
import { ALL_STICKERS, TOTAL_STICKERS } from '@/lib/data';
import { useCollection } from '@/contexts/CollectionContext';
import { getAccount, getDatabases } from '@/lib/appwrite/client';
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import Progress from '@/components/Progress';
import { useToast } from '@/components/Toast';

type Profile = { $id: string; name: string; city: string | null; email: string };
type Friend = Profile & { friendCollection: Record<string, number>; owned: number };
type Tab = 'matches' | 'friends' | 'invite';

export default function AmigosPage() {
  const { collection } = useCollection();
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('matches');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [candidates, setCandidates] = useState<Profile[]>([]);
  const [myId, setMyId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const account = getAccount();
      const databases = getDatabases();
      try {
        const user = await account.get();
        setMyId(user.$id);

        const fsRes = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.FRIENDSHIPS, [
          Query.or([Query.equal('user_id', user.$id), Query.equal('friend_id', user.$id)]),
          Query.equal('status', 'accepted'),
          Query.limit(200),
        ]);

        const friendIds = (fsRes.documents as unknown as { user_id: string; friend_id: string }[]).map(d =>
          d.user_id === user.$id ? d.friend_id : d.user_id
        );

        if (friendIds.length === 0) { setFriends([]); setLoading(false); return; }

        const [profilesRes, colsRes] = await Promise.all([
          databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.PROFILES, [Query.equal('$id', friendIds), Query.limit(200)]),
          databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.COLLECTION, [Query.equal('user_id', friendIds), Query.limit(5000)]),
        ]);

        const colMap: Record<string, Record<string, number>> = {};
        (colsRes.documents as unknown as { user_id: string; sticker_id: string; count: number }[]).forEach(d => {
          if (!colMap[d.user_id]) colMap[d.user_id] = {};
          colMap[d.user_id][d.sticker_id] = d.count;
        });

        setFriends((profilesRes.documents as unknown as Profile[]).map(p => ({
          ...p,
          friendCollection: colMap[p.$id] ?? {},
          owned: Object.values(colMap[p.$id] ?? {}).filter(v => v > 0).length,
        })));
      } catch { toast('Erro ao carregar amigos.', 'error'); }
      setLoading(false);
    }
    load();
  }, []);

  const matches = useMemo(() =>
    friends.map(f => {
      const theyOfferIWant: string[] = [];
      const iOfferTheyWant: string[] = [];
      ALL_STICKERS.forEach(s => {
        if ((f.friendCollection[s.id] ?? 0) > 1 && !collection[s.id]) theyOfferIWant.push(s.id);
        if ((collection[s.id] ?? 0) > 1 && !(f.friendCollection[s.id] ?? 0)) iOfferTheyWant.push(s.id);
      });
      return { friend: f, theyOfferIWant, iOfferTheyWant, matchCount: Math.min(theyOfferIWant.length, iOfferTheyWant.length) };
    }).sort((a, b) => b.matchCount - a.matchCount),
  [friends, collection]);

  async function searchUser() {
    const q = searchInput.trim();
    if (!q) return toast('Digite um nome ou e-mail para buscar.', 'error');
    const databases = getDatabases();
    try {
      const isEmail = q.includes('@');
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.PROFILES, [
        isEmail
          ? Query.equal('email', q.toLowerCase())
          : Query.or([Query.equal('name', q), Query.search('name', q)]),
        Query.limit(5),
      ]);
      if (res.documents.length === 0) return toast('Nenhum usuário encontrado.', 'error');
      const found = (res.documents as unknown as Profile[]).filter(p => p.$id !== myId && !friends.find(f => f.$id === p.$id));
      if (found.length === 0) return toast('Nenhum usuário novo encontrado.', 'default');
      setCandidates(found);
    } catch { toast('Erro ao buscar usuário.', 'error'); }
  }

  async function addFriend(friendId: string) {
    if (!myId) return;
    const databases = getDatabases();
    let firstDocId: string | null = null;
    try {
      const doc1 = await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.FRIENDSHIPS, ID.unique(), { user_id: myId, friend_id: friendId, status: 'accepted' });
      firstDocId = doc1.$id;
      await databases.createDocument(APPWRITE_DATABASE_ID, COLLECTIONS.FRIENDSHIPS, ID.unique(), { user_id: friendId, friend_id: myId, status: 'accepted' });
      toast('Amigo adicionado!', 'success');
      setCandidates([]);
      setSearchInput('');
    } catch {
      if (firstDocId) {
        try { await databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.FRIENDSHIPS, firstDocId); } catch {}
      }
      toast('Erro ao adicionar amigo.', 'error');
    }
  }

  const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fc-screen">
      <div className="fc-toolbar">
        <div className="fc-tabs">
          <button className={tab === 'matches' ? 'is-active' : ''} onClick={() => setTab('matches')}>Trocas possíveis</button>
          <button className={tab === 'friends' ? 'is-active' : ''} onClick={() => setTab('friends')}>
            Meus amigos <span className="fc-tab-count">{friends.length}</span>
          </button>
          <button className={tab === 'invite' ? 'is-active' : ''} onClick={() => setTab('invite')}>Adicionar amigos</button>
        </div>
      </div>

      {loading && <div className="fc-empty-state">Carregando...</div>}

      {!loading && tab === 'matches' && (
        <div className="fc-matches">
          {matches.length === 0 && <div className="fc-empty-state">Adicione amigos para ver matches de troca.</div>}
          {matches.map(({ friend, theyOfferIWant, iOfferTheyWant, matchCount }) => (
            <div key={friend.$id} className="fc-match-card">
              <div className="fc-match-head">
                <div className="fc-avatar">{initials(friend.name)}</div>
                <div className="fc-match-info">
                  <div className="fc-match-name">{friend.name}</div>
                  <div className="fc-mute">{friend.city ?? ''}</div>
                </div>
                <div className="fc-match-score">
                  <div className="fc-match-num">{matchCount}</div>
                  <div className="fc-mute">trocas casadas</div>
                </div>
              </div>
              <div className="fc-match-cols">
                <div>
                  <div className="fc-col-head">Você precisa, ela(e) tem repetida</div>
                  <div className="fc-chip-row">
                    {theyOfferIWant.slice(0, 10).map(id => <span key={id} className="fc-chip fc-chip-want">{id}</span>)}
                    {theyOfferIWant.length > 10 && <span className="fc-chip">+{theyOfferIWant.length - 10}</span>}
                    {theyOfferIWant.length === 0 && <span className="fc-mute">nada agora</span>}
                  </div>
                </div>
                <div>
                  <div className="fc-col-head">Você tem repetida, ela(e) precisa</div>
                  <div className="fc-chip-row">
                    {iOfferTheyWant.slice(0, 10).map(id => <span key={id} className="fc-chip fc-chip-offer">{id}</span>)}
                    {iOfferTheyWant.length > 10 && <span className="fc-chip">+{iOfferTheyWant.length - 10}</span>}
                    {iOfferTheyWant.length === 0 && <span className="fc-mute">nada agora</span>}
                  </div>
                </div>
              </div>
              <div className="fc-match-actions">
                <button className="fc-btn-ghost fc-btn-sm" style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={() => router.push(`/chat/${friend.$id}`)}>
                  <MessageCircle size={14} /> Abrir conversa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'friends' && (
        <div className="fc-friend-list">
          {friends.length === 0 && <div className="fc-empty-state">Você ainda não tem amigos. Adicione na aba ao lado.</div>}
          {friends.map(f => (
            <div key={f.$id} className="fc-friend-row">
              <div className="fc-avatar">{initials(f.name)}</div>
              <div className="fc-friend-info">
                <div className="fc-friend-name">{f.name}</div>
                <div className="fc-mute" style={{ fontSize: 12 }}>{f.city ?? ''}</div>
                <Progress value={f.owned} total={TOTAL_STICKERS} height={4} />
                <div style={{ fontSize: 11, color: 'var(--fc-ink-muted)', marginTop: 2 }}>{f.owned}/{TOTAL_STICKERS} ({Math.round(f.owned / TOTAL_STICKERS * 100)}%)</div>
              </div>
              <button className="fc-btn-ghost fc-btn-sm" onClick={() => router.push(`/chat/${f.$id}`)}>
                Conversar
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'invite' && (
        <div style={{ maxWidth: 480 }}>
          <div className="fc-card" style={{ marginBottom: 16 }}>
            <h3>Adicionar amigo por e-mail</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="fc-search" style={{ flex: 1 }} value={searchInput}
                onChange={e => setSearchInput(e.target.value)} placeholder="Nome ou e-mail do amigo"
                onKeyDown={e => e.key === 'Enter' && searchUser()} />
              <button className="fc-btn-primary" onClick={searchUser}>Buscar</button>
            </div>
          </div>
          <div className="fc-friend-list">
            {candidates.map(c => (
              <div key={c.$id} className="fc-friend-row">
                <div className="fc-avatar">{initials(c.name)}</div>
                <div className="fc-friend-info">
                  <div className="fc-friend-name">{c.name}</div>
                  <div className="fc-mute" style={{ fontSize: 12 }}>{c.city ?? ''}</div>
                </div>
                <button className="fc-btn-primary fc-btn-sm" style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={() => addFriend(c.$id)}>
                  <UserPlus size={14} /> Adicionar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
