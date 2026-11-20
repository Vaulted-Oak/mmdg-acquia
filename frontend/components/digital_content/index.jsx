import { useState } from 'react';
import { FormattedText } from 'drupal-canvas';
import useSWR from 'swr';

/**
 * A members-only Digital Content page.
 *
 * Title, collection label and body come from Canvas (mapped from the item's
 * fields by its content template). The videos and gallery are not Canvas
 * props: the app's server loads them after checking the member's tier and
 * hands them over through SWR, so links a member may not see never reach
 * the browser. Without that data (for example in Workbench) only the header
 * renders.
 */
export const DIGITAL_CONTENT_EXTRAS_KEY = 'member-digital-content';

const LockIcon = () => (
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
);

const Gallery = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const image = images[current];
  if (!image) {
    return null;
  }
  return (
    <figure>
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        className="aspect-[2/1] w-full bg-neutral-200 object-cover"
      />
      <figcaption className="mt-4 min-h-6">{image.alt}</figcaption>
      {images.length > 1 && (
        <ul className="mt-3 flex gap-4 overflow-x-auto pb-2">
          {images.map((thumbnail, index) => (
            <li key={thumbnail.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-current={index === current}
                className={
                  index === current
                    ? 'block'
                    : 'block opacity-50 hover:opacity-100 focus-visible:opacity-100'
                }
              >
                <img
                  src={thumbnail.src}
                  alt=""
                  className="h-20 w-32 object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
};

const DigitalContent = ({ title, collection, body }) => {
  // No fetcher: this only reads what the server placed in the SWR fallback.
  const { data } = useSWR(DIGITAL_CONTENT_EXTRAS_KEY, null);
  const videos = data?.videos ?? [];
  const gallery = data?.gallery ?? [];

  return (
    <article className="mx-auto w-full max-w-[1440px] px-5 pt-8 pb-16 lg:px-8">
      <a
        href="/member-dashboard"
        className="text-lg text-brand underline underline-offset-4"
      >
        Back to Member Dashboard
      </a>

      <header className="mx-auto mt-12 max-w-3xl text-center">
        {collection && (
          <p className="inline-block rounded-full bg-forest px-6 py-2.5 text-xs font-semibold tracking-[0.15em] text-white uppercase">
            {collection}
          </p>
        )}
        <h1 className="mt-5 font-display text-5xl lg:text-7xl">{title}</h1>
        {body && (
          <FormattedText className="mt-3 flex flex-col gap-4 text-lg lg:text-xl [&_a]:text-brand [&_a]:underline">
            {body}
          </FormattedText>
        )}
      </header>

      {videos.length > 0 && (
        <ol className="mx-auto mt-14 flex max-w-5xl flex-col gap-12">
          {videos.map((video) => (
            <li key={video.id}>
              {video.locked ? (
                <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-ink/85 p-6 text-center text-lg text-white">
                  <LockIcon />
                  <p>{data?.lockText}</p>
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
              {!video.locked && video.descriptionHtml && (
                <FormattedText className="mt-1 text-lg">
                  {video.descriptionHtml}
                </FormattedText>
              )}
            </li>
          ))}
        </ol>
      )}

      {gallery.length > 0 && (
        <div className="mx-auto mt-14 max-w-5xl">
          <Gallery images={gallery} />
        </div>
      )}
    </article>
  );
};

export default DigitalContent;
