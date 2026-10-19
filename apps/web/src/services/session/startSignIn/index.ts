import type { IStartRequest } from '@fridgeboard/contract/auth';
import { WEB_SERVICE } from '@fridgeboard/contract/configuration/services/constants';
import type { StartResult } from '../types';
import { postAuth } from '../utils/postAuth';
import { readFailureReason } from '../utils/readFailureReason';
import { getServicePath } from '../../configuration';

export const startSignIn = async (email: string): Promise<StartResult> => {
  const body: IStartRequest = { email };
  const response = await postAuth(await getServicePath(WEB_SERVICE.start), body);
  return response.ok ? { ok: true } : { ok: false, reason: await readFailureReason(response) };
};
