import { ShopColor } from '../../services/shoppingList/constants';
import type { Shop } from '../../services/shoppingList/types';

export const buildShop = (id: string, color: ShopColor = ShopColor.Sky): Shop => ({
  id,
  name: id,
  color,
  order: 0,
});
