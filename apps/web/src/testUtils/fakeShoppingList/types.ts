import type { ShopColor } from '../../services/shoppingList/constants';
import type { ItemChanges } from '../../services/shoppingList/types';

export type AddFakeItem = { name: string; shopId: string };

export type AddFakeShop = { name: string; color: ShopColor };

export type UpdateFakeItem = { id: string; changes: ItemChanges };
