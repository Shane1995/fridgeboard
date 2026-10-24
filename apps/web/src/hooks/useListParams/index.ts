import { MAIN_LIST_ID } from '@fridgeboard/contract/lists/constants';
import { useActiveHousehold } from '../useActiveHousehold';
import { NO_HOUSEHOLD_MESSAGE } from './constants';
import type { ListParams } from './types';

export const useListParams = (): ListParams => {
  const householdId = useActiveHousehold()?.id;
  const listId = MAIN_LIST_ID;
  return {
    householdId,
    listId,
    paramsFor: (extra = {}) => {
      if (householdId === undefined) {
        throw new Error(NO_HOUSEHOLD_MESSAGE);
      }
      return { householdId, listId, ...extra };
    },
    queryKeyFor: (name) => [name, { householdId: householdId ?? '', listId }],
  };
};
