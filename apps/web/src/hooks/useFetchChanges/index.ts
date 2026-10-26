import { useRef } from 'react';
import type { FetchChanges } from '../../services/realtime/types';
import { useChangesQuery } from '../useChangesQuery';
import { useLatest } from '../useLatest';
import { useListParams } from '../useListParams';
import { CHANGES_FAILED } from './constants';

// Asks the server what changed since a rev, through the changes query. The query is never fetched
// on its own, so each call here is a deliberate `refetch`.
export const useFetchChanges = (): FetchChanges => {
  const { householdId } = useListParams();
  const since = useRef<number | undefined>(undefined);
  const { refetch } = useChangesQuery({ householdId, since });
  const latest = useLatest(refetch);
  return async (options) => {
    since.current = options.since;
    const { data, error } = await latest.current();
    if (data === undefined) {
      throw error ?? new Error(CHANGES_FAILED);
    }
    return data;
  };
};
