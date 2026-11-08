import type { ShopColorName } from '@fridgeboard/contract/lists';

type SeedShop = { id: string; name: string; color: ShopColorName };
type SeedItem = { id: string; name: string; shopIds: string[]; checked: boolean };

export const SEED_SHOPS: SeedShop[] = [
  { id: 'shop-supermarket', name: 'Supermarket', color: 'mint' },
  { id: 'shop-butcher', name: 'Butcher', color: 'tomato' },
  { id: 'shop-greengrocer', name: 'Greengrocer', color: 'lime' },
  { id: 'shop-bakery', name: 'Bakery', color: 'mustard' },
];

export const SEED_ITEMS: SeedItem[] = [
  { id: 'item-milk', name: 'Milk', shopIds: ['shop-supermarket'], checked: false },
  { id: 'item-pasta', name: 'Pasta', shopIds: ['shop-supermarket'], checked: false },
  { id: 'item-eggs', name: 'Eggs', shopIds: ['shop-supermarket'], checked: true },
  { id: 'item-chicken', name: 'Chicken thighs', shopIds: ['shop-butcher'], checked: false },
  { id: 'item-apples', name: 'Apples', shopIds: ['shop-greengrocer'], checked: false },
  { id: 'item-bananas', name: 'Bananas', shopIds: ['shop-greengrocer'], checked: true },
  {
    id: 'item-bread',
    name: 'Sourdough',
    shopIds: ['shop-bakery', 'shop-supermarket'],
    checked: false,
  },
  { id: 'item-soap', name: 'Washing-up liquid', shopIds: [], checked: false },
];
