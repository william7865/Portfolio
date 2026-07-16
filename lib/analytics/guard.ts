import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionKey, verifySession } from './session';

export const SESSION_COOKIE = 'dash_session';

/** Redirects to the login page unless a valid session cookie is present. */
export async function requireSession(): Promise<void> {
  const secret = process.env.SESSION_SECRET;
  const password = process.env.DASHBOARD_PASSWORD;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  // Fail closed: a missing secret or password locks the dashboard, never opens it.
  if (!secret || !password || !verifySession(sessionKey(secret, password), token, Date.now())) {
    redirect('/dashboard/login');
  }
}
