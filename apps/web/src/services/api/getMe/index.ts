import type { Endpoint } from '../../configuration/types';
import type { IMeResponse } from '@fridgeboard/contract/me';
import { ME_REQUEST_FAILED } from './constants';

export const getMe = async (
  endpoint: Endpoint,
  fetcher: (endpoint: Endpoint) => Promise<Response>,
): Promise<IMeResponse> => {
  const response = await fetcher(endpoint);
  if (!response.ok) {
    throw new Error(ME_REQUEST_FAILED, { cause: response.status });
  }
  return response.json();
};
