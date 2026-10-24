import type { MutationName } from '../../services/configuration/schema/constants';
import type { ListItem, ShoppingListRepository } from '../../services/shoppingList/types';

export type ShoppingListMutationOptions<TData, TVariables> = {
  name: MutationName;
  write: (call: { repository: ShoppingListRepository; variables: TVariables }) => Promise<TData>;
  invalidates: readonly string[];
  optimistic?: (change: { items: ListItem[]; variables: TVariables }) => ListItem[];
};
