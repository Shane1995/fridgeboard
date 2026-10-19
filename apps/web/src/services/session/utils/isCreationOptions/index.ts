import type { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/browser';

export const isCreationOptions = (
  value: unknown,
): value is PublicKeyCredentialCreationOptionsJSON =>
  typeof value === 'object' &&
  value !== null &&
  'challenge' in value &&
  typeof value.challenge === 'string' &&
  value.challenge !== '' &&
  'user' in value &&
  typeof value.user === 'object' &&
  value.user !== null;
