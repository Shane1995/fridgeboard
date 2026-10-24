import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser';
import { FailureReason } from '../../session/constants';

export type StartPasskeyRegistrationResult =
  | { ok: true; options: PublicKeyCredentialCreationOptionsJSON }
  | { ok: false; reason: FailureReason };
