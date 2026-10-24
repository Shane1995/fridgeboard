import { FailureReason } from '../../services/session/constants';

export type RegisterPasskeyResult = { ok: true } | { ok: false; reason: FailureReason };
