import type { IMeResponse } from '@fridgeboard/contract/me';
import { getServicePath } from '../../configuration';
import { WEB_SERVICE } from '@fridgeboard/contract/configuration/services/constants';
import { apiFetch } from '../apiFetch';
import { ME_REQUEST_FAILED } from './constants';

export const getMe = async (): Promise<IMeResponse> => {
  const response = await apiFetch(await getServicePath(WEB_SERVICE.me));
  if (!response.ok) {
    throw new Error(ME_REQUEST_FAILED, { cause: response.status });
  }
  return response.json();
};
