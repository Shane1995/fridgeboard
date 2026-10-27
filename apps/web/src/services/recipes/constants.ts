import { ShopColor, UNSORTED_SHOP_ID, UNSORTED_SHOP_NAME } from '../shoppingList/constants';
import type { RecipeShop } from './types';

export const RECIPE_TAGS = ['quick', 'veggie', 'batch-cook', 'dessert', 'family'] as const;

export const RECIPE_NAME_MAX_LENGTH = 80;
export const RECIPE_NOTES_MAX_LENGTH = 500;
export const RECIPE_STEP_MAX_LENGTH = 300;
export const RECIPE_DEFAULT_SERVINGS = 4;

export const MOCK_SHOPS: readonly RecipeShop[] = [
  { id: 'express', name: 'Express', color: ShopColor.Mint },
  { id: 'sainsburys', name: "Sainsbury's order", color: ShopColor.Tomato },
  { id: 'market', name: 'Market Saturday', color: ShopColor.Mustard },
  { id: UNSORTED_SHOP_ID, name: UNSORTED_SHOP_NAME, color: ShopColor.Slate },
];

export const MOCK_ON_LIST: readonly string[] = ['milk', 'onions', 'eggs'];
