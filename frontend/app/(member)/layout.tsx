import { Figtree, Newsreader } from 'next/font/google';
import type { ReactNode } from 'react';
import SiteFooter from '@/components/site/site-footer';
import SiteHeader from '@/components/site/site-header';
import { isPreview } from '@/lib/preview';

// Stand-ins for the design's typefaces until the licensed fonts are supplied.
const display = Newsreader({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-newsreader',
});
const body = Figtree({ subsets: ['latin'], variable: '--font-figtree' });

export default async function MemberLayout({
  children,
}: {
  children: ReactNode;
}) {
  const preview = await isPreview();
  return (
    <div
      className={`${display.variable} ${body.variable} flex min-h-screen flex-col bg-white font-body text-ink`}
    >
      {preview && (
        <p className="bg-amber-300 px-5 py-2 text-center text-sm text-amber-950">
          <strong>Editor preview.</strong> Drafts are shown and every tier is
          unlocked. Members only see published content for their tier.
        </p>
      )}
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
