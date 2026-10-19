import { UNAUTHORISED_STATUS } from '../../constants';
import { RefreshResultKind } from '../constants';
import type { RefreshResult } from '../types';
import { isTokenResponse } from '../utils/isTokenResponse';
import { request } from '../../api/request';
import { POST } from '../constants';

export const exchangeRefreshCookie = async (refreshPath: string): Promise<RefreshResult> => {
  const response = await request(refreshPath, { method: POST }).catch(() => undefined);
  const body: unknown = response?.ok ? await response.json().catch(() => undefined) : undefined;

  if (response?.ok) {
    return isTokenResponse(body)
      ? { kind: RefreshResultKind.Tokens, tokens: body }
      : { kind: RefreshResultKind.Rejected };
  }
  return response?.status === UNAUTHORISED_STATUS
    ? { kind: RefreshResultKind.Rejected }
    : { kind: RefreshResultKind.Unavailable };
};
