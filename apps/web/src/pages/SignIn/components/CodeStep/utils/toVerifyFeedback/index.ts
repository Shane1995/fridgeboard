import { FailureReason } from '../../../../../../services/session/constants';
import type { VerifyResult } from '../../../../../../services/session/types';
import { SIGN_IN_COPY } from '../../../../constants';
import type { CodeFeedback } from '../../types';

export const toVerifyFeedback = (result: VerifyResult): CodeFeedback | undefined => {
  if (result.ok) {
    return undefined;
  }
  if ('next' in result) {
    return { message: SIGN_IN_COPY.confirmed, isError: false, isExpired: false };
  }
  return {
    message: SIGN_IN_COPY.reasons[result.reason],
    isError: true,
    isExpired: result.reason === FailureReason.Expired,
  };
};
