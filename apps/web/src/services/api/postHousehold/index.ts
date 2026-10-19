import type {
  ICreateHouseholdErrorResponse,
  ICreateHouseholdResponse,
} from '@fridgeboard/contract/households';
import type { PostHouseholdResult } from './types';

const REASONS: readonly ICreateHouseholdErrorResponse['reason'][] = [
  'invalid-name',
  'not-allowed',
  'household-exists',
];

export const postHousehold = async (
  householdsPath: string,
  name: string,
  fetcher: (path: string, init: RequestInit) => Promise<Response>,
): Promise<PostHouseholdResult> => {
  const response = await fetcher(householdsPath, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  if (response.ok) {
    const body: ICreateHouseholdResponse = await response.json();
    return { ok: true, id: body.id, name: body.name };
  }
  const body: Partial<ICreateHouseholdErrorResponse> = await response.json().catch(() => ({}));
  const reason = REASONS.find((known) => known === body.reason);
  return { ok: false, reason: reason ?? 'unknown' };
};
