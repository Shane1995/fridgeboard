import type { IChangesResponse } from '@fridgeboard/contract/changes';
import { QueryName, WebService } from '../../services/configuration/schema/constants';
import { useApiQuery } from '../useApiQuery';
import type { QueryResult } from '../useQuery/types';
import type { UseChangesQueryOptions } from './types';

// Never fetched by itself: live sync calls `refetch` when it needs to know what it missed, and
// `getSince` supplies the rev the app has seen at that moment.
export const useChangesQuery = ({
  householdId,
  getSince,
}: UseChangesQueryOptions): QueryResult<IChangesResponse> =>
  useApiQuery<IChangesResponse>({
    name: QueryName.changes,
    service: WebService.householdChanges,
    params: householdId === undefined ? {} : { householdId },
    query: () => {
      const since = getSince();
      return since === undefined ? {} : { since: String(since) };
    },
    enabled: false,
  });
