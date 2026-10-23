import type { Endpoint } from '../../configuration/types';
import type { IVerifyRequest } from '@fridgeboard/contract/auth';
import { NEXT_STEP_STATUS, POST, UNKNOWN_REASON } from '../constants';
import type { VerifyResponse } from '../types';
import { isTokenResponse } from '../utils/isTokenResponse';
import { isVerifyNextResponse } from '../utils/isVerifyNextResponse';
import { request } from '../../api/request';
import { readFailureReason } from '../utils/readFailureReason';

export const verifyCode = async (endpoint: Endpoint, code: string): Promise<VerifyResponse> => {
  const payload: IVerifyRequest = { code };
  const response = await request(endpoint, { method: POST, body: JSON.stringify(payload) });

  if (!response.ok) {
    return { ok: false, reason: await readFailureReason(response) };
  }

  const body: unknown = await response.json().catch(() => undefined);

  if (response.status === NEXT_STEP_STATUS) {
    return isVerifyNextResponse(body)
      ? { ok: false, next: body.next }
      : { ok: false, reason: UNKNOWN_REASON };
  }

  if (!isTokenResponse(body)) {
    return { ok: false, reason: UNKNOWN_REASON };
  }
  return { ok: true, tokens: body };
};
