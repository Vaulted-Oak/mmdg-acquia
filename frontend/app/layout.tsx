import { CanvasRuntime } from '@drupal-canvas/headless-next/CanvasRuntime';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { DraftIndicator } from '../components/draft-indicator';
import { PreviewNotice } from '../components/preview-notice';
import SwrFallback, {
  type FallbackEntry,
} from '../components/swr-fallback';
import { getMenu } from '../lib/menu';
import './globals.css';

export const metadata: Metadata = {
  title: 'Canvas Headless — Next.js',
  description: 'A minimal Drupal Canvas headless frontend.',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Keys match the SWR keys the Canvas components use, so the components
  // render this server-loaded data without fetching from the browser.
  const entries: FallbackEntry[] = [
    [['menu_items', 'main'], await getMenu('main')],
  ];

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <CanvasRuntime>
          <SwrFallback entries={entries}>
            <DraftIndicator />
            <PreviewNotice />
            {children}
          </SwrFallback>
        </CanvasRuntime>
      </body>
    </html>
  );
}
