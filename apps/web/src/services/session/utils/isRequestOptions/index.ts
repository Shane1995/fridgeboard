import type { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';

export const isRequestOptions = (value: unknown): value is PublicKeyCredentialRequestOptionsJSON =>
  typeof value === 'object' &&
  value !== null &&
  'challenge' in value &&
  typeof value.challenge === 'string' &&
  value.challenge !== '';
