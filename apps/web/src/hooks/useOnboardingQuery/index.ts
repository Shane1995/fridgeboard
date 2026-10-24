import type { IOnboardingResponse } from '@fridgeboard/contract/onboarding';
import { WebService } from '../../services/configuration/services/constants';
import { useApiQuery } from '../useApiQuery';
import type { QueryResult } from '../useQuery/types';
import { ONBOARDING_QUERY_KEY } from './constants';

// Only worth asking while `/me` says there is onboarding left.
export const useOnboardingQuery = (enabled: boolean): QueryResult<IOnboardingResponse> =>
  useApiQuery({ name: ONBOARDING_QUERY_KEY, service: WebService.onboarding, enabled });
