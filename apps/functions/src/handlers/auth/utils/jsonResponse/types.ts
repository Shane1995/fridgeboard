import type {
  IMeResponse,
  IAuthErrorResponse,
  ITokenResponse,
  IVerifyNextResponse,
} from '@fridgeboard/contract';

export type ResponseBody = IMeResponse | IAuthErrorResponse | ITokenResponse | IVerifyNextResponse;
