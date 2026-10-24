import type {
  IAuthErrorResponse,
  ITokenResponse,
  IVerifyNextResponse,
} from '@fridgeboard/contract/auth';
import type {
  ICreateHouseholdErrorResponse,
  ICreateHouseholdResponse,
  IHouseholdMembersResponse,
  IHouseholdsResponse,
} from '@fridgeboard/contract/households';
import type {
  IShop,
  IShopsResponse,
  IHistoryResponse,
  IListErrorResponse,
  IListItem,
  IListItemsResponse,
} from '@fridgeboard/contract/lists';
import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import type { IPasskeyStartResponse, IPasskeysStartResponse } from '@fridgeboard/contract/auth';
import type { IMeResponse } from '@fridgeboard/contract/me';
import type { IUsernameErrorResponse, IUsernameResponse } from '@fridgeboard/contract/username';

export type ResponseBody =
  | IMeResponse
  | IAuthErrorResponse
  | ITokenResponse
  | IVerifyNextResponse
  | IUsernameResponse
  | IUsernameErrorResponse
  | ICreateHouseholdResponse
  | ICreateHouseholdErrorResponse
  | IHouseholdsResponse
  | IHouseholdMembersResponse
  | IListItem
  | IListItemsResponse
  | IShop
  | IShopsResponse
  | IHistoryResponse
  | IListErrorResponse
  | IOnboardingResponse
  | IPasskeyStartResponse
  | IPasskeysStartResponse;
