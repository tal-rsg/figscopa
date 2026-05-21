'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/sign-in' : '/api/auth/sign-up';
      const body = mode === 'login' ? { email, password: pw } : { name, email, password: pw };
      const res = await fetch(endpoint, { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) return setErr(data.error ?? 'Erro desconhecido');
      router.replace('/album');
      router.refresh();
    } catch {
      setErr('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fc-auth">
      <div className="fc-auth-card">
        <Logo size={32} />
        <p className="fc-auth-sub">Controle seu álbum, encontre trocas, converse com amigos.</p>

        <div className="fc-auth-tabs">
          <button className={mode === 'login' ? 'is-active' : ''} onClick={() => { setMode('login'); setErr(''); }}>Entrar</button>
          <button className={mode === 'register' ? 'is-active' : ''} onClick={() => { setMode('register'); setErr(''); }}>Criar conta</button>
        </div>

        <form className="fc-auth-form" onSubmit={submit}>
          {mode === 'register' && (
            <label>
              Nome
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" autoComplete="name" required />
            </label>
          )}
          <label>
            E-mail
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" required />
          </label>
          <label>
            Senha
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : '••••••••'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
          </label>
          {err && <div className="fc-auth-err">{err}</div>}
          <button type="submit" className="fc-btn-primary fc-btn-block" disabled={loading}>
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="fc-auth-note">Seus dados ficam salvos na nuvem via Appwrite e acessíveis em qualquer dispositivo.</p>
      </div>
    </div>
  );
}
