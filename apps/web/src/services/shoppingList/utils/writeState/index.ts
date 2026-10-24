import { writeLocalStorage } from '../../../../utils/writeLocalStorage';
import { shoppingListStorageKey } from '../../constants';
import type { ShoppingListState } from '../../types';

export const writeState = (householdId: string, state: ShoppingListState): void =>
  writeLocalStorage(shoppingListStorageKey(householdId), JSON.stringify(state));
