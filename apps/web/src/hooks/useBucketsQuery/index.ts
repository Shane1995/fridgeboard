import type { Bucket } from '../../services/shoppingList/types';
import { requireRepository, useShoppingList } from '../useShoppingList';
import { useQuery } from '../useQuery';
import type { QueryResult } from '../useQuery/types';
import { BUCKETS_QUERY_KEY } from './constants';

export const useBucketsQuery = (): QueryResult<Bucket[]> => {
  const { householdId, repository } = useShoppingList();
  return useQuery({
    queryKey: [BUCKETS_QUERY_KEY, householdId],
    queryFn: () => requireRepository(repository).listBuckets(),
    enabled: repository !== undefined,
  });
};
