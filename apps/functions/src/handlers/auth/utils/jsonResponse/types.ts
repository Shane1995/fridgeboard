export type AuthReason =
  | 'no-invite'
  | 'verify-email'
  | 'bad-code'
  | 'expired'
  | 'forbidden'
  | 'unauthorised';

export type VerifyNextResponse = { next: 'enter-code' };

export type ResponseBody =
  | { reason: AuthReason }
  | { accessToken: string; expiresIn: number }
  | VerifyNextResponse;
