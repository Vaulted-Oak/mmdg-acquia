import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getDigitalContent } from '@/lib/gated-content';
import { getCurrentMember } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Digital content' };

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
  const content = await getDigitalContent(id, member);
  // Missing and not-allowed look the same, so a member cannot probe for
  // content above their tier.
  if (!content) {
    redirect('/member-dashboard');
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link href="/member-dashboard" className="text-blue-700 hover:underline">
        ← Member dashboard
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{content.title}</h1>
      {/* Body HTML is Drupal's filtered output for an editor-written field. */}
      <div
        className="mt-4 text-gray-800"
        dangerouslySetInnerHTML={{ __html: content.bodyHtml }}
      />

      <ol className="mt-8 flex flex-col gap-8">
        {content.videos.map((video) => (
          <li key={video.id}>
            <h2 className="text-xl font-semibold">{video.title}</h2>
            {video.locked ? (
              <div className="mt-3 flex aspect-video items-center justify-center rounded-lg bg-gray-200 p-6 text-center text-gray-600">
                <p>
                  <span aria-hidden="true">🔒 </span>
                  Please upgrade to access more exclusive content.
                </p>
              </div>
            ) : (
              <>
                <iframe
                  src={video.embedUrl}
                  title={video.title}
                  allow="fullscreen; picture-in-picture"
                  allowFullScreen
                  className="mt-3 aspect-video w-full rounded-lg"
                />
                <div
                  className="mt-2 text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: video.descriptionHtml ?? '',
                  }}
                />
              </>
            )}
          </li>
        ))}
      </ol>
    </main>
  );
}
