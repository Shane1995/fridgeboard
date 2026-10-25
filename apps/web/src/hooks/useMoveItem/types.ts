import type { ListItem, Shop } from '../../services/shoppingList/types';

export type MoveItemOptions = { item: ListItem; from: Shop; to: Shop };
