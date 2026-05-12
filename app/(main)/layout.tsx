import { redirect } from 'next/navigation';
import { Query } from 'node-appwrite';
import { createSessionClient } from '@/lib/appwrite/server';
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import { CollectionProvider } from '@/contexts/CollectionContext';
import { ToastProvider } from '@/components/Toast';
import Nav from '@/components/Nav';
import { ALL_STICKERS } from '@/lib/data';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const { account, databases } = await createSessionClient();

  let user;
  try {
    user = await account.get();
  } catch {
    redirect('/login');
  }

  const [profileRes, collectionRes] = await Promise.all([
    databases.getDocument(APPWRITE_DATABASE_ID, COLLECTIONS.PROFILES, user.$id).catch(() => null),
    databases.listDocuments(APPWRITE_DATABASE_ID, COLLECTIONS.COLLECTION, [
      Query.equal('user_id', user.$id),
      Query.limit(5000),
    ]).catch(() => ({ documents: [] })),
  ]);

  const profile = {
    name: profileRes?.name ?? user.name ?? user.email?.split('@')[0] ?? 'Usuário',
    city: profileRes?.city ?? '',
  };

  const initial: Record<string, number> = {};
  (collectionRes.documents as unknown as { sticker_id: string; count: number }[]).forEach(d => {
    initial[d.sticker_id] = d.count;
  });

  const repCount = ALL_STICKERS.reduce((acc, s) => acc + (initial[s.id] > 1 ? initial[s.id] - 1 : 0), 0);

  return (
    <ToastProvider>
      <CollectionProvider initial={initial} userId={user.$id}>
        <div className="fc-app">
          <Nav profile={profile} repCount={repCount} />
          <main className="fc-main">{children}</main>
        </div>
      </CollectionProvider>
    </ToastProvider>
  );
}
