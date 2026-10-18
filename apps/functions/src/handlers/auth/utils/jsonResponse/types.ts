export type AuthReason =
  | 'no-invite'
  | 'verify-email'
  | 'bad-code'
  | 'expired'
  | 'forbidden'
  | 'unauthorised';

export type ResponseBody = { reason: AuthReason } | { accessToken: string; expiresIn: number };
