import type { IChangesResponse } from '@fridgeboard/contract/changes';
import { QueryName, WebService } from '../../services/configuration/schema/constants';
import { useApiQuery } from '../useApiQuery';
import type { QueryResult } from '../useQuery/types';
import type { UseChangesQueryOptions } from './types';

// Never fetched by itself: live sync calls `refetch` when it needs to know what it missed, and
// `since` holds the rev the app has seen, read at the moment of the request.
export const useChangesQuery = ({
  householdId,
  since,
}: UseChangesQueryOptions): QueryResult<IChangesResponse> =>
  useApiQuery<IChangesResponse>({
    name: QueryName.changes,
    service: WebService.householdChanges,
    params: householdId === undefined ? {} : { householdId },
    query: () => (since.current === undefined ? {} : { since: String(since.current) }),
    enabled: false,
  });
