import { createHmac, timingSafeEqual } from 'node:crypto';
import { FLOW_TTL_MS, TOKEN_SEPARATOR } from './constants.ts';
import type { AuthFlow, FlowPayload } from './types.ts';

export type { AuthFlow } from './types.ts';

const sign = (payload: string, key: string): Buffer =>
  createHmac('sha256', key).update(payload).digest();

export const signFlow = (flow: AuthFlow, key: string, now: number): string => {
  const body: FlowPayload = { ...flow, exp: now + FLOW_TTL_MS };
  const payload = Buffer.from(JSON.stringify(body)).toString('base64url');
  return `${payload}${TOKEN_SEPARATOR}${sign(payload, key).toString('base64url')}`;
};

export const verifyFlow = (token: string, key: string, now: number): AuthFlow | undefined => {
  const parts = token.split(TOKEN_SEPARATOR);
  const [payload, signature] = parts;
  if (parts.length !== 2 || !payload || !signature) {
    return undefined;
  }

  const expected = sign(payload, key);
  const actual = Buffer.from(signature, 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return undefined;
  }

  const decoded: Partial<Record<keyof FlowPayload, unknown>> =
    JSON.parse(Buffer.from(payload, 'base64url').toString()) ?? {};
  const { email, session, kind, exp } = decoded;
  if (
    typeof email !== 'string' ||
    typeof session !== 'string' ||
    (kind !== 'sign-up' && kind !== 'sign-in') ||
    typeof exp !== 'number' ||
    now > exp
  ) {
    return undefined;
  }

  return { email, session, kind };
};
