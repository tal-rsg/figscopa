import { NextResponse } from 'next/server';
import { Client, Account, Databases, ID, Permission, Role } from 'node-appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_DATABASE_ID, COLLECTIONS, SESSION_COOKIE_NAME } from '@/lib/appwrite/config';

export async function POST(req: Request) {
  const { name, email, password, city = '' } = await req.json();

  const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
  const account = new Account(client);

  try {
    const user = await account.create(ID.unique(), email, password, name);
    const session = await account.createEmailPasswordSession(email, password);

    // Create profile document with user's session
    const userClient = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setSession(session.secret);
    const databases = new Databases(userClient);

    await databases.createDocument(
      APPWRITE_DATABASE_ID,
      COLLECTIONS.PROFILES,
      user.$id,
      { name, email, city },
      [Permission.read(Role.users()), Permission.update(Role.user(user.$id)), Permission.delete(Role.user(user.$id))]
    );

    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE_NAME, session.secret, {
      httpOnly: false,
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
