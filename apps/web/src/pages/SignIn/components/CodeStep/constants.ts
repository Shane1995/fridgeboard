import { SIGN_IN_COPY } from '../../constants';
import type { CodeFeedback } from './types';

export const UNKNOWN_FEEDBACK: CodeFeedback = {
  message: SIGN_IN_COPY.reasons.unknown,
  isError: true,
  isExpired: false,
};
