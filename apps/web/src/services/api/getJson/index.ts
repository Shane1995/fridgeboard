import type { Endpoint } from '../../configuration/types';
import { GET_REQUEST_FAILED } from './constants';

export const getJson = async <TData>(
  endpoint: Endpoint,
  fetcher: (endpoint: Endpoint) => Promise<Response>,
): Promise<TData> => {
  const response = await fetcher(endpoint);
  if (!response.ok) {
    throw new Error(GET_REQUEST_FAILED, { cause: response.status });
  }
  return response.json();
};
