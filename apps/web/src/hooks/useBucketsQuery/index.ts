import type { IBucketsResponse } from '@fridgeboard/contract/lists';
import { WebService } from '../../services/configuration/schema/constants';
import type { Bucket } from '../../services/shoppingList/types';
import { toBucket } from '../../services/shoppingList/utils/toBucket';
import { useApiQuery } from '../useApiQuery';
import { useListParams } from '../useListParams';
import type { QueryResult } from '../useQuery/types';
import { BUCKETS_QUERY_KEY } from './constants';

export const useBucketsQuery = (): QueryResult<Bucket[]> => {
  const { householdId, paramsFor } = useListParams();
  return useApiQuery({
    name: BUCKETS_QUERY_KEY,
    service: WebService.listBuckets,
    params: householdId === undefined ? {} : paramsFor(),
    enabled: householdId !== undefined,
    select: ({ buckets }: IBucketsResponse) => buckets.map(toBucket),
  });
};
