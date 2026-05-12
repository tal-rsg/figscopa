'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Star, Users, BarChart2, LogOut } from 'lucide-react';
import Logo from './Logo';

interface Profile { name: string }

const LINKS = [
  { href: '/album',     label: 'Álbum',        Icon: BookOpen },
  { href: '/repetidas', label: 'Repetidas',    Icon: Star },
  { href: '/amigos',    label: 'Amigos',       Icon: Users },
  { href: '/stats',     label: 'Estatísticas', Icon: BarChart2 },
];

export default function Nav({ profile, repCount }: { profile: Profile; repCount: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const repLabel = repCount > 99 ? '99+' : String(repCount);

  async function logout() {
    await fetch('/api/auth/sign-out', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <>
      <header className="fc-topbar">
        <Link href="/album"><Logo /></Link>

        <nav className="fc-nav fc-nav-desktop">
          {LINKS.map(({ href, label, Icon }) => (
            <button key={href} className={pathname.startsWith(href) ? 'is-active' : ''} onClick={() => router.push(href)}>
              <Icon size={16} />
              {label}
              {href === '/repetidas' && repCount > 0 && (
                <span className="fc-badge-rep">{repLabel}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="fc-user">
          <span className="fc-user-name">{profile.name}</span>
          <button onClick={logout} aria-label="Sair" title="Sair" style={{ color: 'var(--fc-ink-muted)' }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <nav className="fc-nav-mobile">
        {LINKS.map(({ href, label, Icon }) => (
          <button key={href} className={pathname.startsWith(href) ? 'is-active' : ''} onClick={() => router.push(href)}>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <Icon size={20} />
              {href === '/repetidas' && repCount > 0 && (
                <span className="fc-badge-rep" style={{ position: 'absolute', top: -6, right: -8 }}>{repLabel}</span>
              )}
            </div>
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
