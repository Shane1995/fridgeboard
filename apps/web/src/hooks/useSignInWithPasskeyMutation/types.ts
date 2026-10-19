import type { FailureReason } from '../../services/session/types';

export type PasskeySignInResult =
  | { ok: true }
  | { ok: false; reason: 'fallback' | 'cancelled' | FailureReason };
