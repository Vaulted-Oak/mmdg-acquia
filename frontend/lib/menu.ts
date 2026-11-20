import 'server-only';

import { getSourceClient } from './source';

export interface MenuItem {
  id: string;
  title: string;
  url: string;
  parent: string;
  weight: number;
}

/**
 * Loads a Drupal menu on the server. Returns plain fields only, so the result
 * can cross into browser components. A failure yields an empty menu instead
 * of taking the whole page down.
 */
export async function getMenu(name: string): Promise<MenuItem[]> {
  try {
    // Without rawResponse the client returns the deserialized items.
    const items = (await getSourceClient().getResource(
      'menu_items',
      name,
    )) as MenuItem[] | null;
    return (items ?? []).map(({ id, title, url, parent, weight }) => ({
      id,
      title,
      url,
      parent,
      weight,
    }));
  } catch (error) {
    console.error(`[source] Could not load the "${name}" menu.`, error);
    return [];
  }
}
