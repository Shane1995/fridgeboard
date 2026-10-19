import type { IUsernameErrorResponse } from '@fridgeboard/contract/username';

export type PutUsernameFailureReason = IUsernameErrorResponse['reason'] | 'unknown';

export type PutUsernameResult =
  | { ok: true; username: string }
  | { ok: false; reason: PutUsernameFailureReason };
