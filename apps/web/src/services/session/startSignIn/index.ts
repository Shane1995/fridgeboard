import type { IStartRequest } from '@fridgeboard/contract/auth';
import type { StartResult } from '../types';
import { request } from '../../api/request';
import { POST } from '../constants';
import { readFailureReason } from '../utils/readFailureReason';

export const startSignIn = async (startPath: string, email: string): Promise<StartResult> => {
  const body: IStartRequest = { email };
  const response = await request(startPath, { method: POST, body: JSON.stringify(body) });
  return response.ok ? { ok: true } : { ok: false, reason: await readFailureReason(response) };
};
