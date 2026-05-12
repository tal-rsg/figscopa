import { redirect } from 'next/navigation';
import { createSessionClient } from '@/lib/appwrite/server';

export default async function Home() {
  try {
    const { account } = await createSessionClient();
    await account.get();
    redirect('/album');
  } catch {
    redirect('/login');
  }
}
