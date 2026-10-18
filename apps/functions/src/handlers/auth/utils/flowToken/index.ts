import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto';
import { CIPHER, FLOW_TTL_MS, IV_LENGTH, KEY_INFO, KEY_LENGTH, TAG_LENGTH } from './constants.ts';
import type { AuthFlow, FlowPayload } from './types.ts';

export type { AuthFlow } from './types.ts';

const deriveKey = (flowKey: string): Buffer =>
  Buffer.from(hkdfSync('sha256', flowKey, '', KEY_INFO, KEY_LENGTH));

export const sealFlow = (flow: AuthFlow, key: string, now: number): string => {
  const body: FlowPayload = { ...flow, exp: now + FLOW_TTL_MS };
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(CIPHER, deriveKey(key), iv, { authTagLength: TAG_LENGTH });
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(body)), cipher.final()]);
  return Buffer.concat([iv, ciphertext, cipher.getAuthTag()]).toString('base64url');
};

export const openFlow = (token: string, key: string, now: number): AuthFlow | undefined => {
  const bytes = Buffer.from(token, 'base64url');
  if (bytes.length <= IV_LENGTH + TAG_LENGTH) {
    return undefined;
  }

  const iv = bytes.subarray(0, IV_LENGTH);
  const ciphertext = bytes.subarray(IV_LENGTH, bytes.length - TAG_LENGTH);
  const tag = bytes.subarray(bytes.length - TAG_LENGTH);

  try {
    const decipher = createDecipheriv(CIPHER, deriveKey(key), iv, { authTagLength: TAG_LENGTH });
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString();
    const decoded: Partial<Record<keyof FlowPayload, unknown>> = JSON.parse(plaintext) ?? {};
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
  } catch {
    return undefined;
  }
};
