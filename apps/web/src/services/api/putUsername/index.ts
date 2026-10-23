import type { Endpoint } from '../../configuration/types';
import type { IUsernameErrorResponse, IUsernameResponse } from '@fridgeboard/contract/username';
import type { PutUsernameResult } from './types';

const REASONS: readonly IUsernameErrorResponse['reason'][] = [
  'invalid-username',
  'username-taken',
  'username-set',
];

export const putUsername = async (
  endpoint: Endpoint,
  username: string,
  fetcher: (endpoint: Endpoint, init: RequestInit) => Promise<Response>,
): Promise<PutUsernameResult> => {
  const response = await fetcher(endpoint, {
    method: 'PUT',
    body: JSON.stringify({ username }),
  });
  if (response.ok) {
    const body: IUsernameResponse = await response.json();
    return { ok: true, username: body.username };
  }
  const body: Partial<IUsernameErrorResponse> = await response.json().catch(() => ({}));
  const reason = REASONS.find((known) => known === body.reason);
  return { ok: false, reason: reason ?? 'unknown' };
};
