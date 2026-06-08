import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from './session';

export const SESSION_COOKIE = 'dash_session';

/** Redirects to the login page unless a valid session cookie is present. */
export async function requireSession(): Promise<void> {
  const secret = process.env.SESSION_SECRET ?? '';
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!verifySession(secret, token, Date.now())) {
    redirect('/dashboard/login');
  }
}
