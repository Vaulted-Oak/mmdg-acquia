'use client';

import type { ReactNode } from 'react';
import { SWRConfig, unstable_serialize, type Arguments } from 'swr';

/** One piece of server-loaded data and the SWR key a component reads it by. */
export type FallbackEntry = [key: Arguments, data: unknown];

/**
 * Seeds SWR with data the server already fetched from Source.
 *
 * The browser cannot read Source's content API (public access is off), so
 * components must not refetch on mount: they render the server's data as is.
 */
export default function SwrFallback({
  entries,
  children,
}: {
  entries: FallbackEntry[];
  children: ReactNode;
}) {
  const fallback = Object.fromEntries(
    entries.map(([key, data]) => [unstable_serialize(key), data]),
  );
  return (
    <SWRConfig
      value={{
        fallback,
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
