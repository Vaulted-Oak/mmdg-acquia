/**
 * Tier-gated content.
 *
 * This is the only place that decides what a member may see. It loads the
 * full records from Source with the server credential, then returns view
 * models that already have locked material removed: a locked video carries
 * no URL and no description, so nothing sensitive can reach the browser.
 *
 * Rule (same as the WordPress site): a member has one tier and may see an
 * item when that tier is ticked on it. An item with no tiers ticked is
 * visible to no one. An expired or unmapped member sees everything locked.
 */
import 'server-only';

import { isActive, tierNameFor, type Member } from './members';
import { getSourceClient } from './source';

interface SourceTier {
  id: string;
  name: string;
}

interface SourceVideo {
  id: string;
  title: string;
  status: boolean;
  body?: { processed?: string } | null;
  video_url?: { uri?: string } | null;
  tiers?: SourceTier[] | null;
}

interface SourceDigitalContent {
  id: string;
  title: string;
  body?: { processed?: string } | null;
  tiers?: SourceTier[] | null;
  videos?: SourceVideo[] | null;
}

export interface VideoView {
  id: string;
  title: string;
  locked: boolean;
  /** Present only when the member may watch the video. */
  embedUrl?: string;
  descriptionHtml?: string;
}

export interface DigitalContentCard {
  id: string;
  title: string;
  locked: boolean;
}

export interface DigitalContentView {
  id: string;
  title: string;
  bodyHtml: string;
  videos: VideoView[];
}

function memberTier(member: Member): string | null {
  return isActive(member) ? tierNameFor(member) : null;
}

function canSee(
  tiers: SourceTier[] | null | undefined,
  tierName: string | null,
): boolean {
  return (
    tierName !== null && (tiers ?? []).some((tier) => tier.name === tierName)
  );
}

/** Turns a Vimeo or YouTube page link into its player URL. */
export function toEmbedUrl(url: string): string {
  try {
    const { hostname, pathname, searchParams } = new URL(url);
    const host = hostname.replace(/^www\./, '');
    if (host === 'youtube.com' && searchParams.get('v')) {
      return `https://www.youtube.com/embed/${searchParams.get('v')}`;
    }
    if (host === 'youtu.be') {
      return `https://www.youtube.com/embed${pathname}`;
    }
    if (host === 'vimeo.com') {
      // Unlisted Vimeo links look like vimeo.com/<id>/<hash>.
      const [id, hash] = pathname.split('/').filter(Boolean);
      return `https://player.vimeo.com/video/${id}${hash ? `?h=${hash}` : ''}`;
    }
  } catch {
    // Fall through and use the link as given.
  }
  return url;
}

async function loadAll(): Promise<SourceDigitalContent[]> {
  const items = (await getSourceClient().getCollection('node--digital_content', {
    queryString:
      'filter[status]=1&include=tiers,videos,videos.tiers&sort=title',
  })) as SourceDigitalContent[] | null;
  return items ?? [];
}

/** Every published Digital Content item, flagged locked or open. */
export async function listDigitalContent(
  member: Member,
): Promise<DigitalContentCard[]> {
  const tierName = memberTier(member);
  return (await loadAll()).map((item) => ({
    id: item.id,
    title: item.title,
    locked: !canSee(item.tiers, tierName),
  }));
}

/**
 * One Digital Content item, or null when it does not exist or the member may
 * not open it. Callers cannot tell the two cases apart, on purpose.
 */
export async function getDigitalContent(
  id: string,
  member: Member,
): Promise<DigitalContentView | null> {
  const tierName = memberTier(member);
  const item = (await loadAll()).find((candidate) => candidate.id === id);
  if (!item || !canSee(item.tiers, tierName)) {
    return null;
  }
  return {
    id: item.id,
    title: item.title,
    bodyHtml: item.body?.processed ?? '',
    videos: (item.videos ?? [])
      .filter((video) => video.status)
      .map((video) => {
        const url = video.video_url?.uri;
        if (!url || !canSee(video.tiers, tierName)) {
          return { id: video.id, title: video.title, locked: true };
        }
        return {
          id: video.id,
          title: video.title,
          locked: false,
          embedUrl: toEmbedUrl(url),
          descriptionHtml: video.body?.processed ?? '',
        };
      }),
  };
}
