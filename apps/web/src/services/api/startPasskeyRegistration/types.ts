import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser';
import type { FailureReason } from '../../session/types';

export type StartPasskeyRegistrationResult =
  | { ok: true; options: PublicKeyCredentialCreationOptionsJSON }
  | { ok: false; reason: FailureReason };
