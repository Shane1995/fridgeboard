import type { ListItem, Shop } from '../../services/shoppingList/types';

export type DraggableItemRowProps = { item: ListItem; shops: readonly Shop[]; shopId: string };
