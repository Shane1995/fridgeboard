import type { IAuthErrorResponse } from '@fridgeboard/contract/auth';
import { UNKNOWN_REASON } from '../../constants';
import type { FailureReason } from '../../types';

export const readFailureReason = async (response: Response): Promise<FailureReason> => {
  const body: Partial<IAuthErrorResponse> | null = await response.json().catch(() => null);
  return body?.reason ?? UNKNOWN_REASON;
};
