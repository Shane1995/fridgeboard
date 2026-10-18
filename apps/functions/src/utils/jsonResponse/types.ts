import type {
  IAuthErrorResponse,
  ITokenResponse,
  IVerifyNextResponse,
} from '@fridgeboard/contract/auth';
import type { IMeResponse } from '@fridgeboard/contract/me';

export type ResponseBody = IMeResponse | IAuthErrorResponse | ITokenResponse | IVerifyNextResponse;
