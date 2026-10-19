import { POST, UNKNOWN_REASON } from '../../session/constants';
import { isCreationOptions } from '../../session/utils/isCreationOptions';
import { readFailureReason } from '../../session/utils/readFailureReason';
import type { StartPasskeyRegistrationResult } from './types';

export const startPasskeyRegistration = async (
  startPath: string,
  fetcher: (path: string, init: RequestInit) => Promise<Response>,
): Promise<StartPasskeyRegistrationResult> => {
  const response = await fetcher(startPath, { method: POST });
  if (!response.ok) {
    return { ok: false, reason: await readFailureReason(response) };
  }

  const payload: unknown = await response.json().catch(() => undefined);
  const options =
    typeof payload === 'object' && payload !== null && 'options' in payload
      ? payload.options
      : undefined;
  return isCreationOptions(options) ? { ok: true, options } : { ok: false, reason: UNKNOWN_REASON };
};
