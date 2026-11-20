import { getStandalonePreviewLink } from '@/lib/preview';

/**
 * Shown on every page during an editor's draft session, including inside the
 * Canvas editor's frame. The Canvas editor blocks link clicks in its frame,
 * so the address is also printed in full for copying into a new tab.
 */
export async function PreviewNotice() {
  const link = await getStandalonePreviewLink('/member-dashboard');
  if (!link) {
    return null;
  }
  // The address is not a secret: Source checks the editor's login on it.
  console.log(`[preview] member dashboard preview link: ${link}`);
  return (
    <p className="bg-amber-300 px-5 py-2 text-center text-sm text-amber-950">
      <strong>Editor preview.</strong> To preview the member area with drafts
      and every tier unlocked, open this address in a new tab:{' '}
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="font-semibold break-all underline select-all"
      >
        {link}
      </a>
    </p>
  );
}
