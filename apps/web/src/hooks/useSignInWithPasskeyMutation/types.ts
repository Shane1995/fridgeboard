import { FailureReason } from '../../services/session/constants';

export type PasskeySignInResult = { ok: true } | { ok: false; reason: FailureReason };
