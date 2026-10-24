import type { Endpoint } from '../../configuration/types';
import type {
  ICreateHouseholdErrorResponse,
  ICreateHouseholdResponse,
} from '@fridgeboard/contract/households';
import { REASONS } from './constants';
import type { PostHouseholdResult } from './types';

export const postHousehold = async (
  endpoint: Endpoint,
  name: string,
  fetcher: (endpoint: Endpoint, init: RequestInit) => Promise<Response>,
): Promise<PostHouseholdResult> => {
  const response = await fetcher(endpoint, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  if (response.ok) {
    const body: ICreateHouseholdResponse = await response.json();
    return { ok: true, household: body };
  }
  const body: Partial<ICreateHouseholdErrorResponse> = await response.json().catch(() => ({}));
  const reason = REASONS.find((known) => known === body.reason);
  return { ok: false, reason: reason ?? 'unknown' };
};
