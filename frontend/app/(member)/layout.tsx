import { Figtree, Newsreader } from 'next/font/google';
import type { ReactNode } from 'react';
import SiteFooter from '@/components/site/site-footer';
import SiteHeader from '@/components/site/site-header';

// Stand-ins for the design's typefaces until the licensed fonts are supplied.
const display = Newsreader({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-newsreader',
});
const body = Figtree({ subsets: ['latin'], variable: '--font-figtree' });

export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${display.variable} ${body.variable} flex min-h-screen flex-col bg-white font-body text-ink`}
    >
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
