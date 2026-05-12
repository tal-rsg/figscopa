import { Client, Account, Databases } from 'appwrite';
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID } from './config';

let _client: Client | null = null;

function getClient(): Client {
  if (!_client) {
    _client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
  }
  return _client;
}

export function getAccount()   { return new Account(getClient()); }
export function getDatabases() { return new Databases(getClient()); }
export function getAppwriteClient() { return getClient(); }
