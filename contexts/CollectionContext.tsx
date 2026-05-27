'use client';
import { createContext, useCallback, useContext, useOptimistic, useState, useTransition } from 'react';
import { getDatabases } from '@/lib/appwrite/client';
import { APPWRITE_DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';

type Collection = Record<string, number>;

interface Ctx {
  collection: Collection;
  setCount: (stickerId: string, count: number) => void;
}

const CollectionCtx = createContext<Ctx>({ collection: {}, setCount: () => {} });

export function useCollection() { return useContext(CollectionCtx); }

function applyChange(state: Collection, stickerId: string, count: number): Collection {
  if (count === 0) {
    const next = { ...state };
    delete next[stickerId];
    return next;
  }
  return { ...state, [stickerId]: count };
}

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
  // useState as base so confirmed changes persist after transitions
  const [base, setBase] = useState<Collection>(initial);
  const [collection, updateOptimistic] = useOptimistic(
    base,
    (state: Collection, { stickerId, count }: { stickerId: string; count: number }) =>
      applyChange(state, stickerId, count)
  );

  const setCount = useCallback(
    (stickerId: string, count: number) => {
      startTransition(async () => {
        updateOptimistic({ stickerId, count });
        const databases = getDatabases();
        const docId = `${userId}_${stickerId}`;
        try {
          if (count === 0) {
            await databases.deleteDocument(APPWRITE_DATABASE_ID, COLLECTIONS.COLLECTION, docId);
          } else {
            try {
              await databases.updateDocument(APPWRITE_DATABASE_ID, COLLECTIONS.COLLECTION, docId, { count });
            } catch {
              await databases.createDocument(
                APPWRITE_DATABASE_ID,
                COLLECTIONS.COLLECTION,
                docId,
                { user_id: userId, sticker_id: stickerId, count }
              );
            }
          }
          // Persist the change in the base state so useOptimistic doesn't revert it
          setBase(prev => applyChange(prev, stickerId, count));
        } catch {
          // On failure the optimistic update reverts automatically (base unchanged)
        }
      });
    },
    [userId, updateOptimistic]
  );

  return <CollectionCtx.Provider value={{ collection, setCount }}>{children}</CollectionCtx.Provider>;
}
