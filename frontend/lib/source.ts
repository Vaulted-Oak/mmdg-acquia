/**
 * Server-only access to Acquia Source.
 *
 * Source's public JSON:API access is switched off, so anonymous reads return
 * 403. This module is the one place that holds a credential: it exchanges the
 * server API client's ID and secret for a short-lived token and attaches it
 * to requests. Nothing here may be imported from browser code, and the token
 * must never be handed to the same-origin JSON:API proxy (that would make
 * the proxy a public back door to everything this client can read).
 */
import 'server-only';

import { createJsonApiClient } from 'drupal-canvas/jsonapi-client';

interface CachedToken {
  value: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;
let pendingToken: Promise<string> | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set; the server cannot read from Source.`);
  }
  return value;
}

function siteUrl(): string {
  return requireEnv('CANVAS_SITE_URL').replace(/\/+$/, '');
}

async function requestToken(): Promise<string> {
  const response = await fetch(`${siteUrl()}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: requireEnv('SOURCE_API_CLIENT_ID'),
      client_secret: requireEnv('SOURCE_API_CLIENT_SECRET'),
    }),
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Source token request failed with HTTP ${response.status}.`);
  }
  const body = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  // Renew 30 seconds early so a token never expires mid-request.
  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + (body.expires_in - 30) * 1000,
  };
  return body.access_token;
}

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }
  // Concurrent requests share one token exchange.
  pendingToken ??= requestToken().finally(() => {
    pendingToken = null;
  });
  return pendingToken;
}

/**
 * `fetch` for Source URLs with the server token attached. Refuses any URL
 * that is not on the configured Source site, so the token cannot leak.
 */
export const sourceFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init);
  if (!request.url.startsWith(`${siteUrl()}/`)) {
    throw new Error('sourceFetch only sends requests to the Source site.');
  }
  request.headers.set('Authorization', `Bearer ${await getToken()}`);
  return fetch(request, { cache: 'no-store' });
};

/** JSON:API client for Source that authenticates as the server. */
export function getSourceClient() {
  return createJsonApiClient({
    baseUrl: siteUrl(),
    apiPrefix: process.env.CANVAS_JSONAPI_PREFIX ?? 'api',
    fetch: sourceFetch,
    fetchAuthenticates: true,
  });
}
