import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMemberAreaSettings } from '@/lib/member-area';
import { isPreview } from '@/lib/preview';
import { getCurrentMember } from '@/lib/session';
import { login } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Membership Log In' };

const inputClass =
  'w-full border border-ink bg-white px-5 py-4 text-lg placeholder:text-neutral-500';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  // In an editor preview the page stays put, so its text can be checked.
  if (!(await isPreview()) && (await getCurrentMember())) {
    redirect('/member-dashboard');
  }
  const [{ status }, settings] = await Promise.all([
    searchParams,
    getMemberAreaSettings(),
  ]);

  return (
    <main className="mx-auto w-full max-w-[40rem] px-5 pt-16 pb-24 text-center lg:pt-24">
      <h1 className="font-display text-5xl lg:text-6xl">
        {settings.loginHeading}
      </h1>

      {status === 'failed' && (
        <p role="alert" className="mt-8 border border-brand p-4 text-brand-dark">
          That email and password don&apos;t match a member account.
        </p>
      )}

      <form action={login} className="mt-12 flex flex-col gap-5">
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          placeholder="Email"
          aria-label="Email"
          className={inputClass}
        />
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          aria-label="Password"
          className={inputClass}
        />
        <button
          type="submit"
          className="bg-brand px-5 py-4 text-lg font-semibold text-white hover:bg-brand-dark"
        >
          Sign In
        </button>
      </form>

      <p className="mt-7">
        <Link
          href="/forgot-password"
          className="border-b-2 border-ink pb-0.5 text-lg font-medium"
        >
          Forgot Password?
        </Link>
      </p>

      {/* Help text is Drupal's filtered output for an editor-written field. */}
      <div
        className="mt-8 flex flex-col gap-4 text-lg lg:-mx-24 [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-4"
        dangerouslySetInnerHTML={{ __html: settings.loginHelpHtml }}
      />
    </main>
  );
}
