import type {
  IAuthErrorResponse,
  ITokenResponse,
  IVerifyNextResponse,
} from '@fridgeboard/contract/auth';
import type { IMeResponse } from '@fridgeboard/contract/me';
import type { IUsernameErrorResponse, IUsernameResponse } from '@fridgeboard/contract/username';

export type ResponseBody =
  | IMeResponse
  | IAuthErrorResponse
  | ITokenResponse
  | IVerifyNextResponse
  | IUsernameResponse
  | IUsernameErrorResponse;
