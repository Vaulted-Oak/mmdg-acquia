/**
 * Member directory.
 *
 * On the live WordPress site, members are Salesforce Contacts synced daily:
 * `Latest_MMDG_Membership_Category__c` (a string such as "5. Starting
 * Partner") and `Latest_MMDG_Membership_Expiry_Date__c`. This module keeps
 * that shape so a Salesforce-backed directory can replace the mock one
 * without touching the access rules.
 */
import 'server-only';

import { timingSafeEqual } from 'node:crypto';

export interface Member {
  id: string;
  email: string;
  firstName: string;
  /** Raw membership category, as Salesforce stores it. */
  category: string;
  /** Last day of membership, `YYYY-MM-DD`. */
  expiresOn: string;
}

export interface MemberDirectory {
  /** Returns the member when the email and password match, else null. */
  authenticate(email: string, password: string): Promise<Member | null>;
  findById(id: string): Promise<Member | null>;
}

/**
 * Membership category → name of the tier term in Source. Mirrors the
 * "level mapping" table in the WordPress theme options. A category that is
 * missing here gives the member no tier, so they see everything as locked.
 */
const CATEGORY_TO_TIER: Record<string, string> = {
  '1. Friend': 'Friend',
  '2. Supporting Friend': 'Supporting Friend',
  '3. Sponsoring Friend': 'Sponsoring Friend',
  '4. Collaborating Friend': 'Collaborating Friend',
  '5. Starting Partner': 'Starting Partner',
  '6. Supporting Partner': 'Supporting Partner',
  '7. Sponsoring Partner': 'Sponsoring Partner',
  '8. Collaborating Partner': 'Collaborating Partner',
  '9. Leading Partner': 'Leading Partner',
  '10. Star Supporter': 'Star Supporter',
  '11. Star Sponsor': 'Star Sponsor',
  '12. Star Collaborator': 'Star Collaborator',
  '13. Leader': 'Leader',
  '14. Champion': 'Champion',
  '15. Hero': 'Hero',
  '17. Institutional Partners': 'Institutional Partners',
  '17. Trial Friend Plus': 'Trial Friend Plus',
};

/** The member's tier name, or null when their category is not mapped. */
export function tierNameFor(member: Member): string | null {
  return CATEGORY_TO_TIER[member.category] ?? null;
}

/** Whether the membership is still running today (expiry day included). */
export function isActive(member: Member, now: Date = new Date()): boolean {
  return member.expiresOn >= now.toISOString().slice(0, 10);
}

// Prototype members. They all share the password in DEMO_MEMBER_PASSWORD, so
// no credential lives in the repository.
const MOCK_MEMBERS: Member[] = [
  {
    id: 'friend',
    email: 'friend@example.com',
    firstName: 'Fran',
    category: '1. Friend',
    expiresOn: '2099-12-31',
  },
  {
    id: 'partner',
    email: 'partner@example.com',
    firstName: 'Pat',
    category: '5. Starting Partner',
    expiresOn: '2099-12-31',
  },
  {
    id: 'hero',
    email: 'hero@example.com',
    firstName: 'Harper',
    category: '15. Hero',
    expiresOn: '2099-12-31',
  },
  {
    id: 'expired',
    email: 'expired@example.com',
    firstName: 'Eli',
    category: '15. Hero',
    expiresOn: '2020-01-01',
  },
  {
    id: 'unmapped',
    email: 'unmapped@example.com',
    firstName: 'Uma',
    category: 'Patron $1,000-2,499',
    expiresOn: '2099-12-31',
  },
];

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

const mockDirectory: MemberDirectory = {
  async authenticate(email, password) {
    const expected = process.env.DEMO_MEMBER_PASSWORD;
    // Without a configured password nobody can log in.
    if (!expected || !safeEqual(password, expected)) {
      return null;
    }
    const wanted = email.trim().toLowerCase();
    return MOCK_MEMBERS.find((member) => member.email === wanted) ?? null;
  },
  async findById(id) {
    return MOCK_MEMBERS.find((member) => member.id === id) ?? null;
  },
};

export function getMemberDirectory(): MemberDirectory {
  return mockDirectory;
}
