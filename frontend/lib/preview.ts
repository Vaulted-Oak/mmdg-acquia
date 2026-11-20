/**
 * Editor preview.
 *
 * When an editor opens the app from Source, the Canvas SDK starts a draft
 * session: a cookie tied to that editor's own Source login. In that session
 * the member pages read through the editor's token instead of the server
 * credential, so drafts and unpublished items show, and the member login and
 * tier checks are skipped: Source has already decided what this editor may
 * see, and the app grants nothing on top.
 */
import 'server-only';

import {
  getDraftClient,
  getDraftData,
  isDraftSessionExpired,
} from '@drupal-canvas/headless-next';
import { draftMode } from 'next/headers';
import { getSourceClient } from './source';

/** Whether this request belongs to a live editor draft session. */
export async function isPreview(): Promise<boolean> {
  if (!(await draftMode()).isEnabled) {
    return false;
  }
  const draft = await getDraftData();
  return draft !== null && !isDraftSessionExpired(draft);
}

/**
 * The client to read member content with: the editor's own in a preview,
 * otherwise the server's. An expired session falls back to the server
 * client, where the usual member login and tier checks apply again.
 */
export async function getContentClient() {
  if ((await draftMode()).isEnabled) {
    const draft = await getDraftData();
    if (draft && !isDraftSessionExpired(draft)) {
      return getDraftClient(draft);
    }
  }
  return getSourceClient();
}
