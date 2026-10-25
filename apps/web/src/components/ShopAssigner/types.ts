import type { Shop } from '../../services/shoppingList/types';

export type ShopAssignerProps = {
  shops: readonly Shop[];
  selectedIds: readonly string[];
  onChange: (shopIds: string[]) => void;
};
