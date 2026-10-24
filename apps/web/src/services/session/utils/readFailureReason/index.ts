import type { IAuthErrorResponse } from '@fridgeboard/contract/auth';
import { FailureReason } from '../../constants';

export const readFailureReason = async (response: Response): Promise<FailureReason> => {
  const body: Partial<IAuthErrorResponse> | null = await response.json().catch(() => null);
  return (
    Object.values(FailureReason).find((reason) => reason === body?.reason) ?? FailureReason.Unknown
  );
};
