/**
 * Editable text and links for the member area, from the single "Member Area
 * Settings" item in Source. Every value has a built-in default, so the pages
 * still render if the item is missing, unpublished or Source is unreachable.
 */
import 'server-only';

import type { MemberContact } from './members';
import { getSourceClient } from './source';

export interface LinkSetting {
  href: string;
  label: string;
}

export interface MemberAreaSettings {
  loginHeading: string;
  loginHelpHtml: string;
  benefitsHeading: string;
  digitalHeading: string;
  lockText: string;
  renewLink: LinkSetting | null;
  upgradeLink: LinkSetting | null;
  defaultContact: MemberContact | null;
}

interface SourceLink {
  uri?: string | null;
  title?: string | null;
}

interface SourceSettings {
  login_heading?: string | null;
  login_help?: { processed?: string } | null;
  benefits_heading?: string | null;
  digital_heading?: string | null;
  lock_text?: string | null;
  renew_link?: SourceLink | null;
  upgrade_link?: SourceLink | null;
  contact_name?: string | null;
  contact_title?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
}

const DEFAULTS: MemberAreaSettings = {
  loginHeading: 'Membership Log In',
  loginHelpHtml: '',
  benefitsHeading: 'Redeem Your Benefits',
  digitalHeading: 'Digital Content',
  lockText: 'Please upgrade to access more exclusive content.',
  renewLink: null,
  upgradeLink: null,
  defaultContact: null,
};

function toLink(link: SourceLink | null | undefined, fallbackLabel: string) {
  return link?.uri
    ? { href: link.uri, label: link.title || fallbackLabel }
    : null;
}

export async function getMemberAreaSettings(): Promise<MemberAreaSettings> {
  try {
    const items = (await getSourceClient().getCollection('node--member_area', {
      queryString: 'filter[status]=1&sort=-changed&page[limit]=1',
    })) as SourceSettings[] | null;
    const item = items?.[0];
    if (!item) {
      return DEFAULTS;
    }
    return {
      loginHeading: item.login_heading || DEFAULTS.loginHeading,
      loginHelpHtml: item.login_help?.processed ?? '',
      benefitsHeading: item.benefits_heading || DEFAULTS.benefitsHeading,
      digitalHeading: item.digital_heading || DEFAULTS.digitalHeading,
      lockText: item.lock_text || DEFAULTS.lockText,
      renewLink: toLink(item.renew_link, 'Renew'),
      upgradeLink: toLink(item.upgrade_link, 'Upgrade Your Membership'),
      defaultContact: item.contact_name
        ? {
            name: item.contact_name,
            title: item.contact_title ?? undefined,
            phone: item.contact_phone ?? undefined,
            email: item.contact_email ?? undefined,
          }
        : null,
    };
  } catch (error) {
    console.error('[source] Could not load the member area settings.', error);
    return DEFAULTS;
  }
}
