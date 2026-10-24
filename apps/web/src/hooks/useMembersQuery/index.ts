import type { IHouseholdMembersResponse } from '@fridgeboard/contract/households';
import { WebService } from '../../services/configuration/schema/constants';
import { useActiveHousehold } from '../useActiveHousehold';
import { useApiQuery } from '../useApiQuery';
import type { QueryResult } from '../useQuery/types';
import { MEMBERS_QUERY_KEY } from './constants';

export const useMembersQuery = (): QueryResult<IHouseholdMembersResponse> => {
  const householdId = useActiveHousehold()?.id;
  return useApiQuery({
    name: MEMBERS_QUERY_KEY,
    service: WebService.householdMembers,
    params: { householdId: householdId ?? '' },
    enabled: householdId !== undefined,
  });
};
