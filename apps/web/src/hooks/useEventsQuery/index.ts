import type { IEvent, IEventsResponse } from '@fridgeboard/contract/events';
import { WebService } from '../../services/configuration/schema/constants';
import { useActiveHousehold } from '../useActiveHousehold';
import { useApiQuery } from '../useApiQuery';
import { useInvalidateOnChange } from '../useInvalidateOnChange';
import type { QueryResult } from '../useQuery/types';
import { EVENTS_CHANGE_KEYS, EVENTS_CHANGE_TYPES, EVENTS_QUERY_KEY } from './constants';
import type { UseEventsQueryOptions } from './types';

// One request per window. The window is part of the key, so each month is cached on its own and a
// change from another device refreshes every cached window.
export const useEventsQuery = ({
  from,
  to,
  enabled = true,
}: UseEventsQueryOptions): QueryResult<IEvent[]> => {
  const householdId = useActiveHousehold()?.id;
  useInvalidateOnChange({ types: EVENTS_CHANGE_TYPES, keys: EVENTS_CHANGE_KEYS });
  return useApiQuery({
    name: EVENTS_QUERY_KEY,
    service: WebService.events,
    params: { householdId: householdId ?? '', from, to },
    query: () => ({ from, to }),
    enabled: enabled && householdId !== undefined,
    select: ({ events }: IEventsResponse) => events,
  });
};
