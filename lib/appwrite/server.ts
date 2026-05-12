import { Client, Account, Databases } from 'node-appwrite';
import { cookies } from 'next/headers';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, SESSION_COOKIE_NAME } from './config';

export async function createSessionClient() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? '';

  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setSession(session);

  return {
    account:   new Account(client),
    databases: new Databases(client),
  };
}

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY ?? '');

  return {
    account:   new Account(client),
    databases: new Databases(client),
  };
}
