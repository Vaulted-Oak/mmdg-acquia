import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Change Password' };

// Placeholder: the mock member directory has no password management.
export default function ChangePasswordPage() {
  return (
    <main className="mx-auto w-full max-w-[40rem] px-5 pt-16 pb-24 text-center lg:pt-24">
      <h1 className="font-display text-5xl lg:text-6xl">Change Password</h1>
      <p className="mt-8 text-lg">Changing your password isn’t connected in this prototype yet.</p>
      <p className="mt-8">
        <Link
          href="/member-dashboard"
          className="border-b-2 border-ink pb-0.5 text-lg font-medium"
        >
          Back to Member Dashboard
        </Link>
      </p>
    </main>
  );
}
