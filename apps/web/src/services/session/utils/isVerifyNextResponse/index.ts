import type { IVerifyNextResponse } from '@fridgeboard/contract/auth';
import { NEXT_ENTER_CODE } from '../../constants';

export const isVerifyNextResponse = (value: unknown): value is IVerifyNextResponse =>
  typeof value === 'object' && value !== null && 'next' in value && value.next === NEXT_ENTER_CODE;
