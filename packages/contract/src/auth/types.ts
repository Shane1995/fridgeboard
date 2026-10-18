export type IAuthErrorReason =
  | 'no-invite'
  | 'verify-email'
  | 'bad-code'
  | 'expired'
  | 'forbidden'
  | 'unauthorised';

export type IStartRequest = { email: string };

export type IVerifyRequest = { code: string };

export type ITokenResponse = { accessToken: string; expiresIn: number };

export type IVerifyNextResponse = { next: 'enter-code' };

export type IAuthErrorResponse = { reason: IAuthErrorReason };
