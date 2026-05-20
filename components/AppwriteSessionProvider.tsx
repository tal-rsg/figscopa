'use client';
import { getAppwriteClient } from '@/lib/appwrite/client';

export function AppwriteSessionProvider({ session, children }: { session: string; children: React.ReactNode }) {
  // Inject session into the browser SDK singleton so httpOnly cookies can be used
  getAppwriteClient().setSession(session);
  return <>{children}</>;
}
