import { NextResponse } from 'next/server';
import { Client, Account } from 'node-appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, SESSION_COOKIE_NAME } from '@/lib/appwrite/config';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email?.includes('@') || !password) {
    return NextResponse.json({ error: 'E-mail ou senha inválidos.' }, { status: 400 });
  }

  // node-appwrite v24 + Appwrite 1.6: session.secret is only populated when using an API key
  const adminClient = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY ?? '');
  const account = new Account(adminClient);

  try {
    const session = await account.createEmailPasswordSession(email, password);
    const res = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
    res.cookies.set(SESSION_COOKIE_NAME, session.secret, {
      httpOnly: true,
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
