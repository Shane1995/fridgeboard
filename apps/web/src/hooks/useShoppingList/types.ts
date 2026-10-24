import type { ShoppingListRepository } from '../../services/shoppingList/types';

export type ShoppingList = {
  householdId: string | undefined;
  repository: ShoppingListRepository | undefined;
};
