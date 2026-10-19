import type { FailureReason } from '../../services/session/types';

export type RegisterPasskeyResult =
  | { ok: true }
  | { ok: false; reason: 'cancelled' | FailureReason };
