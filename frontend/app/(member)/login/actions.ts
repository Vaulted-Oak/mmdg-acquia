'use server';

import { redirect } from 'next/navigation';
import { getMemberDirectory } from '@/lib/members';
import { endSession, startSession } from '@/lib/session';

export async function login(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const member = await getMemberDirectory().authenticate(email, password);
  if (!member) {
    redirect('/login?status=failed');
  }
  await startSession(member);
  redirect('/member-dashboard');
}

export async function logout(): Promise<void> {
  await endSession();
  redirect('/login');
}
