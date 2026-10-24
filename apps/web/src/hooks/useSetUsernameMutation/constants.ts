import type { IUsernameErrorResponse } from '@fridgeboard/contract/username';

export const USERNAME_FAILURES: readonly IUsernameErrorResponse['reason'][] = [
  'invalid-username',
  'username-taken',
  'username-set',
];
