import type { ListItem } from '../../services/shoppingList/types';

export type CombineItemsOptions = { keeper: ListItem; duplicates: readonly ListItem[] };
