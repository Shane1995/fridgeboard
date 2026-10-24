import { FailureReason } from '../../session/constants';

export type CompletePasskeyRegistrationResult = { ok: true } | { ok: false; reason: FailureReason };
