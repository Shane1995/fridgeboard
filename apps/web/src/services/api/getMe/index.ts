import type { IMeResponse } from '@fridgeboard/contract/me';
import { ME_REQUEST_FAILED } from './constants';

export const getMe = async (
  mePath: string,
  fetcher: (path: string) => Promise<Response>,
): Promise<IMeResponse> => {
  const response = await fetcher(mePath);
  if (!response.ok) {
    throw new Error(ME_REQUEST_FAILED, { cause: response.status });
  }
  return response.json();
};
