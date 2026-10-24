import type { IShop } from '@fridgeboard/contract/lists';
import { ShopColor } from '../../constants';
import type { Shop } from '../../types';

export const toShop = ({ id, name, color, order }: IShop): Shop => ({
  id,
  name,
  color: Object.values(ShopColor).find((known) => known === color) ?? ShopColor.Slate,
  order,
});
