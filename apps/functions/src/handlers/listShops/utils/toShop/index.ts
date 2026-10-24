import type { ShopColorName, IShop } from '@fridgeboard/contract/lists';
import type * as z from 'zod/mini';
import type { ShopItemSchema } from '../../../../utils/items/shopItem/index.ts';

export const toShop = ({ id, name, color, order }: z.infer<typeof ShopItemSchema>): IShop => ({
  id,
  name,
  color: color as ShopColorName,
  order,
});
