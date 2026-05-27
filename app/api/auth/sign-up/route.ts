import { NextResponse } from 'next/server';
import { Client, Account, Databases, Users, ID } from 'node-appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_DATABASE_ID, COLLECTIONS, SESSION_COOKIE_NAME } from '@/lib/appwrite/config';

export async function POST(req: Request) {
  const { name, email, password, city = '' } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Nome é obrigatório.' }, { status: 400 });
  }
  if (!email?.includes('@')) {
    return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'A senha deve ter no mínimo 8 caracteres.' }, { status: 400 });
  }

  // Admin client needed so session.secret is populated (node-appwrite v24 + Appwrite 1.6)
  const adminClient = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY ?? '');
  const account = new Account(adminClient);

  try {
    const user = await account.create(ID.unique(), email, password, name);
    const session = await account.createEmailPasswordSession(email, password);
    const adminDatabases = new Databases(adminClient);

    try {
      await adminDatabases.createDocument(
        APPWRITE_DATABASE_ID,
        COLLECTIONS.PROFILES,
        user.$id,
        { name, email, city }
      );
    } catch (profileErr) {
      // Rollback: delete the Appwrite account so the user can try again
      await new Users(adminClient).delete(user.$id).catch(() => {});
      throw profileErr;
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(session.expire),
    });
    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Erro ao criar conta';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
