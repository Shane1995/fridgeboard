import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import type { IMeResponse } from '@fridgeboard/contract/me';
import { apiFetch } from '../apiFetch';
import { ME_REQUEST_FAILED } from './constants';

export const getMe = async (): Promise<IMeResponse> => {
  const response = await apiFetch(API_PATHS.me);
  if (!response.ok) {
    throw new Error(ME_REQUEST_FAILED, { cause: response.status });
  }
  return response.json();
};
