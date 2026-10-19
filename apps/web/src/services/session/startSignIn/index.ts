import type { IStartRequest } from '@fridgeboard/contract/auth';
import type { StartResult } from '../types';
import { postAuth } from '../utils/postAuth';
import { readFailureReason } from '../utils/readFailureReason';

export const startSignIn = async (startPath: string, email: string): Promise<StartResult> => {
  const body: IStartRequest = { email };
  const response = await postAuth(startPath, body);
  return response.ok ? { ok: true } : { ok: false, reason: await readFailureReason(response) };
};
