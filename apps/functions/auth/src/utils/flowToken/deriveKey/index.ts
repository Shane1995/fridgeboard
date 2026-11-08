import { hkdfSync } from 'node:crypto';
import { HKDF_DIGEST, KEY_INFO, KEY_LENGTH } from '../constants.ts';

export const deriveKey = (flowKey: string): Buffer =>
  Buffer.from(hkdfSync(HKDF_DIGEST, flowKey, '', KEY_INFO, KEY_LENGTH));
