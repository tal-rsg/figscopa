import { NextResponse } from 'next/server';
import { createSessionClient } from '@/lib/appwrite/server';
import { SESSION_COOKIE_NAME } from '@/lib/appwrite/config';

export async function POST() {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession('current');
  } catch {}

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
