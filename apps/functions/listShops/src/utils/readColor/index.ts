import { SHOP_COLORS } from '@fridgeboard/contract/lists/constants';
import type { ShopColorName } from '@fridgeboard/contract/lists';

export const readColor = (value: unknown): ShopColorName | undefined =>
  SHOP_COLORS.find((color) => color === value);
