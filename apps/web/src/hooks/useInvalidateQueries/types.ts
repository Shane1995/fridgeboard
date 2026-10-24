import type { InvalidateQueryFilters } from '@tanstack/react-query';

export type InvalidateQueriesOptions = {
  keys: readonly string[];
  refetchType?: InvalidateQueryFilters['refetchType'];
};
