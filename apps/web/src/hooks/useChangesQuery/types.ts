import type { RefObject } from 'react';

export type UseChangesQueryOptions = {
  householdId: string | undefined;
  since: RefObject<number | undefined>;
};
