import { createDecipheriv } from 'node:crypto';
import { deriveKey } from '../deriveKey/index.ts';
import { CIPHER, IV_LENGTH, TAG_LENGTH } from '../constants.ts';
import type { AuthFlow, FlowPayload } from '../types.ts';
import { isAuthFlowKind } from '../isAuthFlowKind/index.ts';

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
      !isAuthFlowKind(kind) ||
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
