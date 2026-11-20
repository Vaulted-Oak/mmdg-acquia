import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Forgot Password' };

// Placeholder: the mock member directory has no password management.
export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto w-full max-w-[40rem] px-5 pt-16 pb-24 text-center lg:pt-24">
      <h1 className="font-display text-5xl lg:text-6xl">Forgot Password</h1>
      <p className="mt-8 text-lg">Password reset isn’t connected in this prototype yet. Members will be able to request a reset link here.</p>
      <p className="mt-8">
        <Link
          href="/login"
          className="border-b-2 border-ink pb-0.5 text-lg font-medium"
        >
          Back to log in
        </Link>
      </p>
    </main>
  );
}
