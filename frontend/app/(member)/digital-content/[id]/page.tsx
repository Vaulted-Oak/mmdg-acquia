import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import MediaGallery from '@/components/site/media-gallery';
import { getDigitalContent } from '@/lib/gated-content';
import { getMemberAreaSettings } from '@/lib/member-area';
import { getCurrentMember } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Digital Content' };

export default async function DigitalContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const member = await getCurrentMember();
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

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 pt-8 pb-16 lg:px-8">
      <Link
        href="/member-dashboard"
        className="text-lg text-brand underline underline-offset-4"
      >
        Back to Member Dashboard
      </Link>

      <header className="mx-auto mt-12 max-w-3xl text-center">
        {content.collection && (
          <p className="inline-block rounded-full bg-forest px-6 py-2.5 text-xs font-semibold tracking-[0.15em] text-white uppercase">
            {content.collection}
          </p>
        )}
        <h1 className="mt-5 font-display text-5xl lg:text-7xl">
          {content.title}
        </h1>
        {/* Body HTML is Drupal's filtered output for an editor-written field. */}
        <div
          className="mt-3 flex flex-col gap-4 text-lg lg:text-xl [&_a]:text-brand [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: content.bodyHtml }}
        />
      </header>

      {content.videos.length > 0 && (
        <ol className="mx-auto mt-14 flex max-w-5xl flex-col gap-12">
          {content.videos.map((video) => (
            <li key={video.id}>
              {video.locked ? (
                <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-ink/85 p-6 text-center text-lg text-white">
                  <svg
                    width="36"
                    height="36"
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
              ) : (
                <iframe
                  src={video.embedUrl}
                  title={video.title}
                  allow="fullscreen; picture-in-picture"
                  allowFullScreen
                  className="aspect-video w-full"
                />
              )}
              <h2 className="mt-4 text-2xl">{video.title}</h2>
              {!video.locked && (
                <div
                  className="mt-1 text-lg"
                  dangerouslySetInnerHTML={{
                    __html: video.descriptionHtml ?? '',
                  }}
                />
              )}
            </li>
          ))}
        </ol>
      )}

      {content.gallery.length > 0 && (
        <div className="mx-auto mt-14 max-w-5xl">
          <MediaGallery images={content.gallery} />
        </div>
      )}
    </main>
  );
}
