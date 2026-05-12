export const APPWRITE_ENDPOINT    = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? 'https://cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID  = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? '';
export const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? 'figscopa';

export const COLLECTIONS = {
  PROFILES:    'profiles',
  COLLECTION:  'collection',
  FRIENDSHIPS: 'friendships',
  MESSAGES:    'messages',
} as const;

// Cookie that Appwrite browser SDK sets after login
export const SESSION_COOKIE_NAME = `a_session_${APPWRITE_PROJECT_ID}`;
