export type IAuthErrorReason =
  | 'no-invite'
  | 'verify-email'
  | 'bad-code'
  | 'expired'
  | 'forbidden'
  | 'unauthorised'
  | 'recent-code-required'
  | 'passkey-failed';

export type IStartRequest = { email: string };

export type IVerifyRequest = { code: string };

export type ITokenResponse = { accessToken: string; expiresIn: number };

export type IVerifyNextResponse = { next: 'enter-code' };

export type IAuthErrorResponse = { reason: IAuthErrorReason };

export type WebAuthnOptions = Record<string, unknown>;

export type IPasskeyStartResponse = { options: WebAuthnOptions } | { next: 'email-code' };

export type IPasskeyCredentialRequest = { credential: WebAuthnOptions };

export type IPasskeysStartResponse = { options: WebAuthnOptions };
