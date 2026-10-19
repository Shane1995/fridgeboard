import type { IStartRequest } from '@fridgeboard/contract/auth';
import { request } from '../../api/request';
import { POST } from '../constants';
import type { PasskeyStartResult } from '../types';
import { isRequestOptions } from '../utils/isRequestOptions';
import { readFailureReason } from '../utils/readFailureReason';

export const startPasskey = async (
  startPath: string,
  email: string,
): Promise<PasskeyStartResult> => {
  const body: IStartRequest = { email };
  const response = await request(startPath, { method: POST, body: JSON.stringify(body) });
  if (!response.ok) {
    return { ok: false, reason: await readFailureReason(response) };
  }

  const payload: unknown = await response.json().catch(() => undefined);
  const options =
    typeof payload === 'object' && payload !== null && 'options' in payload
      ? payload.options
      : undefined;
  return isRequestOptions(options) ? { ok: true, options } : { ok: false, fallback: true };
};
