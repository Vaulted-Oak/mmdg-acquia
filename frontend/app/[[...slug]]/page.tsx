import CanvasComponentTree from '@drupal-canvas/headless-next/CanvasComponentTree';
import {
  fetchPage,
  isPageRedirect,
  toNextMetadata,
} from '@drupal-canvas/headless-next';
import type { Metadata } from 'next';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { cache } from 'react';
import { isPreview } from '@/lib/preview';

export const dynamic = 'force-dynamic';

interface CatchAllPageProps {
  params: Promise<{ slug?: string[] }>;
}

const getPage = cache((path: string) => fetchPage(path));

async function getPath(params: CatchAllPageProps['params']) {
  const { slug } = await params;
  return `/${(slug ?? []).map(encodeURIComponent).join('/')}`;
}

export async function generateMetadata({
  params,
}: CatchAllPageProps): Promise<Metadata> {
  const page = await getPage(await getPath(params));
  return page && !isPageRedirect(page) ? toNextMetadata(page.head) : {};
}

function memberPreviewPath(
  entity: { entityType: string; bundle: string; uuid: string } | null,
): string | null {
  if (entity?.entityType !== 'node') {
    return null;
  }
  switch (entity.bundle) {
    case 'digital_content':
      return `/digital-content/${entity.uuid}`;
    case 'benefit':
    case 'member_area':
    case 'membership_video':
      return '/member-dashboard';
    default:
      return null;
  }
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const page = await getPage(await getPath(params));

  if (!page) {
    notFound();
  }

  // Source previews an item by loading its own path (for example /node/21).
  // Member content is rendered by dedicated routes, so an editor preview is
  // sent on to the one that shows the item.
  if (!isPageRedirect(page) && (await isPreview())) {
    const target = memberPreviewPath(page.route.entity);
    if (target) {
      redirect(target);
    }
  }

  if (isPageRedirect(page)) {
    const { statusCode, url } = page.redirect;
    if (statusCode === 301 || statusCode === 308) {
      permanentRedirect(url);
    }
    redirect(url);
  }

  return <CanvasComponentTree tree={page.content} context={page.context} />;
}
