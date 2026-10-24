export const CIPHER = 'aes-256-gcm';
export const KEY_INFO = 'fb-auth-flow';
export const KEY_LENGTH = 32;
export const IV_LENGTH = 12;
export const TAG_LENGTH = 16;
export const HKDF_DIGEST = 'sha256';

export enum AuthFlowKind {
  SignUp = 'sign-up',
  SignIn = 'sign-in',
  Passkey = 'passkey',
}
