'use client';
import { createContext, useCallback, useContext, useOptimistic, useTransition } from 'react';
import { getDatabases } from '@/lib/appwrite/client';
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import { Permission, Role } from 'appwrite';

type Collection = Record<string, number>;

interface Ctx {
  collection: Collection;
  setCount: (stickerId: string, count: number) => void;
}

const CollectionCtx = createContext<Ctx>({ collection: {}, setCount: () => {} });

export function useCollection() { return useContext(CollectionCtx); }

export function CollectionProvider({
  children,
  initial,
  userId,
}: {
  children: React.ReactNode;
  initial: Collection;
  userId: string;
}) {
  const [, startTransition] = useTransition();

  const [collection, updateOptimistic] = useOptimistic(
    initial,
    (state: Collection, { stickerId, count }: { stickerId: string; count: number }) => {
      if (count === 0) {
        const next = { ...state };
        delete next[stickerId];
        return next;
      }
      return { ...state, [stickerId]: count };
    }
  );

  const setCount = useCallback(
    (stickerId: string, count: number) => {
      startTransition(async () => {
        updateOptimistic({ stickerId, count });
        const databases = getDatabases();
        const docId = `${userId}_${stickerId}`;
        if (count === 0) {
          try { await databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.COLLECTION, docId); } catch {}
        } else {
          try {
            await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.COLLECTION, docId, { count });
          } catch {
            await databases.createDocument(
              APPWRITE_DATABASE_ID,
              COLLECTIONS.COLLECTION,
              docId,
              { user_id: userId, sticker_id: stickerId, count },
              [Permission.read(Role.users()), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))]
            );
          }
        }
      });
    },
    [userId, updateOptimistic]
  );

  return <CollectionCtx.Provider value={{ collection, setCount }}>{children}</CollectionCtx.Provider>;
}
