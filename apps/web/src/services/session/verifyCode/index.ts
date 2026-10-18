import type { IVerifyRequest } from '@fridgeboard/contract/auth';
import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import { applyTokens } from '../applyTokens';
import { NEXT_STEP_STATUS, UNKNOWN_REASON } from '../constants';
import { refreshSession } from '../refreshSession';
import type { VerifyResult } from '../types';
import { isTokenResponse } from '../utils/isTokenResponse';
import { isVerifyNextResponse } from '../utils/isVerifyNextResponse';
import { postAuth } from '../utils/postAuth';
import { readFailureReason } from '../utils/readFailureReason';

export const verifyCode = async (code: string): Promise<VerifyResult> => {
  const request: IVerifyRequest = { code };
  const response = await postAuth(API_PATHS.verify, request);

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
  applyTokens(body, refreshSession);
  return { ok: true };
};
