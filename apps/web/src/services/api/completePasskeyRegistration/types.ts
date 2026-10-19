import type { FailureReason } from '../../session/types';

export type CompletePasskeyRegistrationResult = { ok: true } | { ok: false; reason: FailureReason };
