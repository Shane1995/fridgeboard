import { MOCK_SHOPS } from '../../../../services/recipes/constants';
import type { ShopSuggestion } from '../../../../services/recipes/types';
import { UNSORTED_SHOP_ID } from '../../../../services/shoppingList/constants';
import { MAX_ALTERNATIVES, SHOP_KEYWORDS, STAPLE_WORDS } from './constants';
import type { SuggestShopsOptions } from './types';

export const suggestShops = ({
  ingredients,
}: SuggestShopsOptions): Record<string, ShopSuggestion> =>
  Object.fromEntries(
    ingredients.map((ingredient) => {
      const item = ingredient.item.toLowerCase();
      const shopId =
        SHOP_KEYWORDS.find(({ words }) => words.some((word) => item.includes(word)))?.shopId ??
        UNSORTED_SHOP_ID;
      const alternativeShopIds = MOCK_SHOPS.map((shop) => shop.id)
        .filter((id) => id !== shopId && id !== UNSORTED_SHOP_ID)
        .slice(0, MAX_ALTERNATIVES);
      return [
        ingredient.id,
        {
          shopId,
          alternativeShopIds,
          isStaple: STAPLE_WORDS.some((word) => item.includes(word)),
        },
      ];
    }),
  );
