import type { Shop, ShopSectionData } from '../../services/shoppingList/types';

export type ShopCardProps = {
  section: ShopSectionData;
  allShops: readonly Shop[];
  draggable: boolean;
};
