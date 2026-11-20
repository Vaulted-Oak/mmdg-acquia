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

interface SourceImageFile {
  uri?: { url?: string } | null;
  resourceIdObjMeta?: {
    alt?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
}

interface SourceMedia {
  id: string;
  name?: string;
  /** Missing when the server credential may not view media. */
  media_image?: SourceImageFile | null;
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
  collection?: { name?: string } | null;
  cover_image?: SourceMedia | null;
  gallery?: SourceMedia[] | null;
}

interface SourceBenefit {
  id: string;
  title: string;
  body?: { processed?: string } | null;
  tiers?: SourceTier[] | null;
  cta_text?: string | null;
  cta_link?: { uri?: string | null } | null;
}

export interface ImageView {
  src: string;
  alt: string;
  width?: number;
  height?: number;
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
  collection: string | null;
  image: ImageView | null;
  locked: boolean;
}

export interface DigitalContentView {
  id: string;
  title: string;
  collection: string | null;
  bodyHtml: string;
  videos: VideoView[];
  gallery: ImageView[];
}

export interface BenefitView {
  id: string;
  title: string;
  bodyHtml: string;
  cta: { label: string; href: string } | null;
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

function sourceOrigin(): string {
  return (process.env.CANVAS_SITE_URL ?? '').replace(/\/+$/, '');
}

function toImage(media: SourceMedia | null | undefined): ImageView | null {
  const file = media?.media_image;
  const url = file?.uri?.url;
  if (!url) {
    return null;
  }
  const meta = file.resourceIdObjMeta;
  return {
    // Source returns site-relative file paths.
    src: url.startsWith('http') ? url : `${sourceOrigin()}${url}`,
    alt: meta?.alt ?? '',
    width: meta?.width ?? undefined,
    height: meta?.height ?? undefined,
  };
}

/** Only web links and mailto links from Source may become a button. */
function safeHref(uri: string | null | undefined): string | null {
  return uri && /^(https?:|mailto:|\/)/i.test(uri) ? uri : null;
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
      'filter[status]=1&sort=title&include=tiers,videos,videos.tiers,' +
      'collection,cover_image.media_image,gallery.media_image',
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
    collection: item.collection?.name ?? null,
    image: toImage(item.cover_image),
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
    collection: item.collection?.name ?? null,
    bodyHtml: item.body?.processed ?? '',
    gallery: (item.gallery ?? [])
      .map(toImage)
      .filter((image): image is ImageView => image !== null),
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

/** The benefits a member's tier includes, in the editors' order. */
export async function listBenefits(member: Member): Promise<BenefitView[]> {
  const tierName = memberTier(member);
  const items = (await getSourceClient().getCollection('node--benefit', {
    queryString: 'filter[status]=1&sort=weight,title&include=tiers',
  })) as SourceBenefit[] | null;
  return (items ?? [])
    .filter((item) => canSee(item.tiers, tierName))
    .map((item) => {
      const href = safeHref(item.cta_link?.uri);
      return {
        id: item.id,
        title: item.title,
        bodyHtml: item.body?.processed ?? '',
        cta: href && item.cta_text ? { label: item.cta_text, href } : null,
      };
    });
}
