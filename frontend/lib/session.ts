/**
 * Member sessions: a signed, HTTP-only cookie that holds only the member ID
 * and an expiry time. The member record is looked up again on every request,
 * so a change to their tier or membership expiry applies immediately.
 */
import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { getMemberDirectory, type Member } from './members';

const COOKIE_NAME = 'mmdg_member';
const SESSION_SECONDS = 60 * 60 * 8;

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error('SESSION_SECRET must be set to at least 32 characters.');
  }
  return value;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

function encode(memberId: string, expiresAt: number): string {
  const payload = Buffer.from(
    JSON.stringify({ memberId, expiresAt }),
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function decode(token: string): string | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    return null;
  }
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }
  try {
    const { memberId, expiresAt } = JSON.parse(
      Buffer.from(payload, 'base64url').toString(),
    ) as { memberId?: unknown; expiresAt?: unknown };
    if (typeof memberId !== 'string' || typeof expiresAt !== 'number') {
      return null;
    }
    return expiresAt > Date.now() ? memberId : null;
  } catch {
    return null;
  }
}

export async function startSession(member: Member): Promise<void> {
  const expiresAt = Date.now() + SESSION_SECONDS * 1000;
  (await cookies()).set(COOKIE_NAME, encode(member.id, expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

/** The logged-in member, or null. */
export async function getCurrentMember(): Promise<Member | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const memberId = token ? decode(token) : null;
  return memberId ? getMemberDirectory().findById(memberId) : null;
}
