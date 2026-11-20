import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { listBenefits, listDigitalContent } from '@/lib/gated-content';
import { getMemberAreaSettings } from '@/lib/member-area';
import { isActive, tierNameFor } from '@/lib/members';
import { getCurrentMember } from '@/lib/session';
import { logout } from '../login/actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Member Dashboard' };

const outlineButton =
  'border-2 border-ink px-8 py-3 text-lg font-medium hover:bg-ink hover:text-white';
const textLink = 'border-b-2 border-ink pb-0.5 font-medium';
const card = 'rounded-lg border border-rule';

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function MemberDashboardPage() {
  const member = await getCurrentMember();
  if (!member) {
    redirect('/login');
  }
  const active = isActive(member);
  const tierName = tierNameFor(member);
  const [settings, benefits, cards] = await Promise.all([
    getMemberAreaSettings(),
    listBenefits(member),
    listDigitalContent(member),
  ]);
  const contact = member.contact ?? settings.defaultContact;

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-10 pb-24 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <h1 className="font-display text-5xl lg:text-7xl">
          Hi, {member.firstName}!
        </h1>
        <div className="flex flex-wrap gap-4">
          <Link href="/change-password" className={outlineButton}>
            Change Password
          </Link>
          <form action={logout}>
            <button type="submit" className={outlineButton}>
              Sign Out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className={`${card} p-8 lg:p-12`}>
          <h2 className="font-display text-4xl lg:text-5xl">Your Membership</h2>
          <p className="mt-6 text-2xl lg:text-3xl">
            {tierName ?? 'No membership tier'}
          </p>
          <p className="mt-4 text-lg lg:text-xl">
            {active ? 'Expiration Date' : 'Expired'}:{' '}
            {formatDate(member.expiresOn)}
          </p>
          {!active && (
            <p role="alert" className="mt-4 text-lg text-brand-dark">
              Your membership has expired. Renew it to see your benefits and
              member content again.
            </p>
          )}
          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-lg">
            {settings.renewLink && (
              <a href={settings.renewLink.href} className={textLink}>
                {settings.renewLink.label}
              </a>
            )}
            {settings.upgradeLink && (
              <a href={settings.upgradeLink.href} className={textLink}>
                {settings.upgradeLink.label}
              </a>
            )}
          </p>
        </section>

        {contact && (
          <section className={`${card} p-8 lg:p-12`}>
            <h2 className="font-display text-4xl lg:text-5xl">Contact</h2>
            <p className="mt-6 text-lg lg:text-xl">
              <span className="font-semibold">{contact.name}</span>
              {contact.title && <span className="block">{contact.title}</span>}
            </p>
            <p className="mt-4 text-lg lg:text-xl">
              {contact.phone && <span className="block">{contact.phone}</span>}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="text-brand underline underline-offset-4"
                >
                  {contact.email}
                </a>
              )}
            </p>
          </section>
        )}
      </div>

      {benefits.length > 0 && (
        <section className="mt-20 lg:mt-28">
          <h2 className="font-display text-4xl lg:text-6xl">
            {settings.benefitsHeading}
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {benefits.map((benefit) => (
              <li key={benefit.id} className={`${card} p-8`}>
                <h3 className="text-2xl lg:text-[1.75rem] lg:leading-tight">
                  {benefit.title}
                </h3>
                {/* Body is Drupal's filtered output for an editor-written field. */}
                <div
                  className="mt-3 text-lg lg:text-xl [&_a]:text-brand [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: benefit.bodyHtml }}
                />
                {benefit.cta && (
                  <a
                    href={benefit.cta.href}
                    className="mt-6 inline-block bg-brand px-10 py-3.5 text-lg font-semibold text-white hover:bg-brand-dark"
                  >
                    {benefit.cta.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {cards.length > 0 && (
        <section className="mt-20 lg:mt-28">
          <h2 className="font-display text-4xl lg:text-6xl">
            {settings.digitalHeading}
          </h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((item) => {
              const inner = (
                <>
                  <div className="relative aspect-[16/9] overflow-hidden bg-neutral-200">
                    {item.image && (
                      <img
                        src={item.image.src}
                        alt=""
                        className="size-full object-cover"
                      />
                    )}
                    {item.locked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/75 p-6 text-center text-white">
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          aria-hidden="true"
                        >
                          <rect x="5" y="11" width="14" height="9" rx="1" />
                          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                        </svg>
                        <p>{settings.lockText}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    {item.collection && (
                      <p className="text-sm font-semibold tracking-widest uppercase">
                        {item.collection}
                      </p>
                    )}
                    <h3 className="mt-1 text-2xl">{item.title}</h3>
                  </div>
                </>
              );
              return (
                <li key={item.id} className={`${card} overflow-hidden`}>
                  {item.locked ? (
                    inner
                  ) : (
                    <Link
                      href={`/digital-content/${item.id}`}
                      className="block hover:bg-neutral-50"
                    >
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
