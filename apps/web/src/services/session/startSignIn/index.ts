import type { IStartRequest } from '@fridgeboard/contract/auth';
import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import type { StartResult } from '../types';
import { postAuth } from '../utils/postAuth';
import { readFailureReason } from '../utils/readFailureReason';

export const startSignIn = async (email: string): Promise<StartResult> => {
  const body: IStartRequest = { email };
  const response = await postAuth(API_PATHS.start, body);
  return response.ok ? { ok: true } : { ok: false, reason: await readFailureReason(response) };
};
