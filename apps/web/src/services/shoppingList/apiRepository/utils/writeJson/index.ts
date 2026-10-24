import { sendJson } from '../../../../api/sendJson';
import { REQUEST_FAILED } from '../../constants';
import type { WriteJsonOptions } from './types';

export const writeJson = async <TData>({
  endpoint,
  method,
  body,
  fetcher,
}: WriteJsonOptions): Promise<TData> => {
  const result = await sendJson<TData, never>(endpoint, method, body, [], fetcher);
  if (!result.ok) {
    throw new Error(REQUEST_FAILED, { cause: result.reason });
  }
  return result.data;
};
