import { useQueryClient } from '@tanstack/react-query';
import type { InvalidateQueriesOptions } from './types';

// With `refetchType: 'none'` the data is only marked stale and fetched again the next time it is
// needed, so nothing is requested for a list nobody is looking at.
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  return ({ keys, refetchType }: InvalidateQueriesOptions) =>
    Promise.all(
      keys.map((key) =>
        queryClient.invalidateQueries({
          queryKey: [key],
          ...(refetchType === undefined ? {} : { refetchType }),
        }),
      ),
    );
};
