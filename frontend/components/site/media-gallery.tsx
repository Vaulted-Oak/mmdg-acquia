'use client';

import { useState } from 'react';
import type { ImageView } from '@/lib/gated-content';

/** A large image with its caption and a strip of thumbnails to pick from. */
export default function MediaGallery({ images }: { images: ImageView[] }) {
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
}
