'use client';
import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Send } from 'lucide-react';
import { Query, Permission, Role, ID } from 'appwrite';
import { getAccount, getDatabases, getAppwriteClient } from '@/lib/appwrite/client';
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';

type Msg = { $id: string; from_user_id: string; to_user_id: string; text: string; kind: string; $createdAt: string };

export default function ChatPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId: friendId } = use(params);
  const router = useRouter();
  const [myId, setMyId] = useState('');
  const [friendName, setFriendName] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      const account = getAccount();
      const databases = getDatabases();
      try {
        const user = await account.get();
        setMyId(user.$id);
        const profile = await databases.getDocument(APPWRITE_DATABASE_ID, COLLECTIONS.PROFILES, friendId);
        setFriendName(profile.name ?? 'Amigo');

        const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.MESSAGES, [
          Query.or([
            Query.and([Query.equal('from_user_id', user.$id), Query.equal('to_user_id', friendId)]),
            Query.and([Query.equal('from_user_id', friendId), Query.equal('to_user_id', user.$id)]),
          ]),
          Query.orderAsc('$createdAt'),
          Query.limit(500),
        ]);
        setMessages(res.documents as unknown as Msg[]);
      } catch {}
    }
    init();
  }, [friendId]);

  // Realtime subscription
  useEffect(() => {
    if (!myId) return;
    const client = getAppwriteClient();
    const channel = `databases.${APPWRITE_DATABASE_ID}.collections.${COLLECTIONS.MESSAGES}.documents`;
    const unsubscribe = client.subscribe(channel, (response) => {
      if (response.events.some((e: string) => e.endsWith('.create'))) {
        const msg = response.payload as Msg;
        const isOurs = (msg.from_user_id === myId && msg.to_user_id === friendId) ||
                       (msg.from_user_id === friendId && msg.to_user_id === myId);
        if (isOurs) setMessages(prev => [...prev, msg]);
      }
    });
    return () => { unsubscribe(); };
  }, [myId, friendId]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !myId || sending) return;
    setSending(true);
    setSendError('');
    const databases = getDatabases();
    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.MESSAGES,
        ID.unique(),
        { from_user_id: myId, to_user_id: friendId, text: text.trim(), kind: 'text' },
        [
          Permission.read(Role.user(myId)), Permission.read(Role.user(friendId)),
          Permission.delete(Role.user(myId)),
        ]
      );
      setText('');
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Erro ao enviar. Tente novamente.');
    }
    setSending(false);
  }

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fc-chat-screen">
      <div className="fc-chat-head">
        <button className="fc-back" onClick={() => router.back()}><ChevronLeft size={16} /></button>
        <div className="fc-avatar fc-avatar-sm">{initials(friendName)}</div>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{friendName}</span>
      </div>

      <div className="fc-chat-body" ref={bodyRef}>
        {messages.length === 0 && <div className="fc-empty-state" style={{ padding: '20px 0' }}>Nenhuma mensagem ainda. Diga oi!</div>}
        {messages.map((msg, i) => {
          const showDate = i === 0 || fmtDate(msg.$createdAt) !== fmtDate(messages[i - 1].$createdAt);
          return (
            <div key={msg.$id}>
              {showDate && (
                <div className="fc-chat-date-sep">{fmtDate(msg.$createdAt)}</div>
              )}
              <div className={`fc-msg ${msg.from_user_id === myId ? 'is-me' : ''} ${msg.kind === 'proposal' ? 'is-proposal' : ''}`}>
                <div className="fc-msg-text">{msg.text}</div>
                <div className="fc-msg-time">{fmtTime(msg.$createdAt)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {sendError && <div style={{ padding: '4px 16px', fontSize: 12, color: 'var(--fc-rep)' }}>{sendError}</div>}

      <form className="fc-chat-input" onSubmit={send}>
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Digite uma mensagem..." disabled={!myId} />
        <button type="submit" className="fc-btn-primary" disabled={!text.trim() || sending} aria-label="Enviar">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
