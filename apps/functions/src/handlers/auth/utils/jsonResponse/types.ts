import type {
  IAuthErrorResponse,
  ITokenResponse,
  IVerifyNextResponse,
} from '@fridgeboard/contract';

export type ResponseBody = IAuthErrorResponse | ITokenResponse | IVerifyNextResponse;
