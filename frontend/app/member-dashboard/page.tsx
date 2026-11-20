import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { listDigitalContent } from '@/lib/gated-content';
import { isActive, tierNameFor } from '@/lib/members';
import { getCurrentMember } from '@/lib/session';
import { logout } from '../login/actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Member dashboard' };

export default async function MemberDashboardPage() {
  const member = await getCurrentMember();
  if (!member) {
    redirect('/login');
  }
  const active = isActive(member);
  const tierName = tierNameFor(member);
  const cards = await listDigitalContent(member);
  const anyLocked = cards.some((card) => card.locked);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Hi, {member.firstName}!</h1>
          <p className="mt-2 text-gray-700">
            {tierName ?? 'No membership tier'} ·{' '}
            {active ? 'Active' : 'Expired'} · {active ? 'Renews' : 'Ended'}{' '}
            {member.expiresOn}
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50"
          >
            Sign out
          </button>
        </form>
      </div>

      {!active && (
        <p role="alert" className="mt-6 rounded-md bg-amber-50 p-4 text-amber-900">
          Your membership has expired. Renew it to watch member content again.
        </p>
      )}

      <h2 className="mt-10 text-xl font-bold">Digital content</h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <li key={card.id}>
            {card.locked ? (
              <div className="h-full rounded-lg border border-gray-200 bg-gray-100 p-5 text-gray-500">
                <p className="font-semibold">
                  <span aria-hidden="true">🔒 </span>
                  {card.title}
                </p>
                <p className="mt-2 text-sm">
                  Please upgrade to access more exclusive content.
                </p>
              </div>
            ) : (
              <Link
                href={`/digital-content/${card.id}`}
                className="block h-full rounded-lg border border-gray-200 p-5 font-semibold text-blue-700 hover:border-blue-600"
              >
                {card.title}
              </Link>
            )}
          </li>
        ))}
      </ul>
      {cards.length === 0 && (
        <p className="mt-4 text-gray-600">No digital content yet.</p>
      )}

      {anyLocked && active && (
        <section className="mt-10 rounded-lg bg-blue-50 p-6">
          <h2 className="text-lg font-bold">Upgrade your membership</h2>
          <p className="mt-1 text-gray-700">
            Higher tiers unlock more rehearsals and performances.
          </p>
        </section>
      )}
    </main>
  );
}
