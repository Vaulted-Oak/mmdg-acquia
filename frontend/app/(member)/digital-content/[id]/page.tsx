import CanvasComponentTree from '@drupal-canvas/headless-next/CanvasComponentTree';
import {
  fetchEntity,
  fetchPage,
  isPageRedirect,
} from '@drupal-canvas/headless-next';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import SwrFallback from '@/components/swr-fallback';
import { getDigitalContent, PREVIEW } from '@/lib/gated-content';
import { getMemberAreaSettings } from '@/lib/member-area';
import { isPreview } from '@/lib/preview';
import { getCurrentMember } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Digital Content' };

// Must match DIGITAL_CONTENT_EXTRAS_KEY in components/digital_content.
const EXTRAS_KEY = 'member-digital-content';

export default async function DigitalContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // An editor previewing from Source needs no member login.
  const member = (await isPreview()) ? PREVIEW : await getCurrentMember();
  if (!member) {
    redirect('/login');
  }
  const { id } = await params;
  const [content, settings] = await Promise.all([
    getDigitalContent(id, member),
    getMemberAreaSettings(),
  ]);
  // Missing and not-allowed look the same, so a member cannot probe for
  // content above their tier.
  if (!content) {
    redirect('/member-dashboard');
  }

  // Title, collection and body are laid out by the item's content template
  // in Source. Only fetched once the tier check above has passed. Source
  // renders a template by node ID, which it only reveals through the item's
  // path, so the path is resolved first; the full-page result is not used
  // because it carries Source's own header and footer.
  const route = content.sourcePath ? await fetchPage(content.sourcePath) : null;
  const node =
    route && !isPageRedirect(route) && route.route.entity?.uuid === content.id
      ? route.route.entity
      : null;
  const entity = node
    ? await fetchEntity({ type: 'node', id: node.id, viewMode: 'full' })
    : null;
  if (!entity?.content) {
    notFound();
  }

  // Videos and gallery are not part of the template: they are handed to the
  // Digital Content component here, already stripped of anything locked.
  const extras = {
    videos: content.videos,
    gallery: content.gallery,
    lockText: settings.lockText,
  };

  return (
    <main>
      <SwrFallback entries={[[EXTRAS_KEY, extras]]}>
        <CanvasComponentTree tree={entity.content} />
      </SwrFallback>
    </main>
  );
}
