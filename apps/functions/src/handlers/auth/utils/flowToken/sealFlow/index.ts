import { createCipheriv, randomBytes } from 'node:crypto';
import { deriveKey } from '../deriveKey/index.ts';
import { CIPHER, IV_LENGTH, TAG_LENGTH } from '../constants.ts';
import type { AuthFlow, FlowPayload } from '../types.ts';

export const sealFlow = (flow: AuthFlow, key: string, now: number, ttlMs: number): string => {
  const body: FlowPayload = { ...flow, exp: now + ttlMs };
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(CIPHER, deriveKey(key), iv, { authTagLength: TAG_LENGTH });
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(body)), cipher.final()]);
  return Buffer.concat([iv, ciphertext, cipher.getAuthTag()]).toString('base64url');
};
