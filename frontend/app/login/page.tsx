import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentMember } from '@/lib/session';
import { login } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Member login' };

const inputClass =
  'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (await getCurrentMember()) {
    redirect('/member-dashboard');
  }
  const { status } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-sm px-6 py-16">
      <h1 className="text-2xl font-bold">Member login</h1>
      {status === 'failed' && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-red-800">
          That email and password don&apos;t match a member account.
        </p>
      )}
      <form action={login} className="mt-6 flex flex-col gap-4">
        <label className="text-sm font-medium">
          Email address
          <input
            type="email"
            name="email"
            required
            autoComplete="username"
            className={inputClass}
          />
        </label>
        <label className="text-sm font-medium">
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Log in
        </button>
      </form>
    </main>
  );
}
