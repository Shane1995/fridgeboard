import type { IInviteErrorResponse } from '@fridgeboard/contract/households';

export const INVITE_FAILURES: readonly IInviteErrorResponse['reason'][] = [
  'invalid-email',
  'not-found',
  'limit-reached',
  'already-invited',
  'verification-failed',
];
