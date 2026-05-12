import { NextResponse } from 'next/server';
import { Client, Account } from 'node-appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, SESSION_COOKIE_NAME } from '@/lib/appwrite/config';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
  const account = new Account(client);

  try {
    const session = await account.createEmailPasswordSession(email, password);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, session.secret, {
      httpOnly: false,          // allow browser SDK to read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(session.expire),
    });
    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao entrar';
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
