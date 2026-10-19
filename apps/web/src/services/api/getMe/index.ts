import type { IMeResponse } from '@fridgeboard/contract/me';
import { apiFetch } from '../apiFetch';
import { ME_REQUEST_FAILED } from './constants';

export const getMe = async (
  mePath: string,
  refresh: () => Promise<boolean>,
): Promise<IMeResponse> => {
  const response = await apiFetch(mePath, refresh);
  if (!response.ok) {
    throw new Error(ME_REQUEST_FAILED, { cause: response.status });
  }
  return response.json();
};
