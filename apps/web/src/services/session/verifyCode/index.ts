import type {
  ITokenResponse,
  IVerifyNextResponse,
  IVerifyRequest,
} from '@fridgeboard/contract/auth';
import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import { applyTokens } from '../applyTokens';
import { NEXT_STEP_STATUS } from '../constants';
import { refreshSession } from '../refreshSession';
import type { VerifyResult } from '../types';
import { postAuth } from '../utils/postAuth';
import { readFailureReason } from '../utils/readFailureReason';

export const verifyCode = async (code: string): Promise<VerifyResult> => {
  const body: IVerifyRequest = { code };
  const response = await postAuth(API_PATHS.verify, body);

  if (response.status === NEXT_STEP_STATUS) {
    const { next }: IVerifyNextResponse = await response.json();
    return { ok: false, next };
  }

  if (!response.ok) {
    return { ok: false, reason: await readFailureReason(response) };
  }

  const tokens: ITokenResponse = await response.json();
  applyTokens(tokens, refreshSession);
  return { ok: true };
};
