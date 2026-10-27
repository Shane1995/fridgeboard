import { useState } from 'react';
import { useToast } from '../../../../../../../../hooks/useToast';
import { MOCK_ON_LIST } from '../../../../../../../../services/recipes/constants';
import { UNSORTED_SHOP_ID } from '../../../../../../../../services/shoppingList/constants';
import { suggestShops } from '../../../../../../utils/suggestShops';
import { ADD_TO_LIST_COPY } from '../../../../constants';
import type {
  IngredientIdOptions,
  RowState,
  ToggleShopOptions,
  UseAddToListOptions,
} from './types';

export const useAddToList = ({ recipe, onDone }: UseAddToListOptions) => {
  const toast = useToast();
  const [suggestions] = useState(() => suggestShops({ ingredients: recipe.ingredients }));
  const isOnList = ({ item }: { item: string }) => MOCK_ON_LIST.includes(item.toLowerCase());
  const [servings, setServings] = useState(recipe.servings);
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      recipe.ingredients.map((ingredient) => {
        const suggestion = suggestions[ingredient.id];
        return [
          ingredient.id,
          {
            ticked: !(suggestion?.isStaple ?? false) && !isOnList({ item: ingredient.item }),
            shopIds: [suggestion?.shopId ?? UNSORTED_SHOP_ID],
          },
        ];
      }),
    ),
  );

  const lines = recipe.ingredients.map((ingredient) => ({
    ingredient,
    suggestion: suggestions[ingredient.id],
    onList: isOnList({ item: ingredient.item }),
    row: rows[ingredient.id] ?? { ticked: false, shopIds: [UNSORTED_SHOP_ID] },
  }));
  const count = lines.filter((line) => line.row.ticked && !line.onList).length;

  const changeServings = ({ by }: { by: number }) =>
    setServings((current) => Math.max(1, current + by));

  const toggleTick = ({ id }: IngredientIdOptions) =>
    setRows((current) => ({
      ...current,
      [id]: { ticked: !current[id]?.ticked, shopIds: current[id]?.shopIds ?? [UNSORTED_SHOP_ID] },
    }));

  const toggleShop = ({ id, shopId }: ToggleShopOptions) =>
    setRows((current) => {
      const existing = current[id]?.shopIds ?? [];
      const next = existing.includes(shopId)
        ? existing.filter((value) => value !== shopId)
        : [...existing, shopId];
      return {
        ...current,
        [id]: { ticked: current[id]?.ticked ?? false, shopIds: next },
      };
    });

  const swapShop = ({ id, shopId }: ToggleShopOptions) =>
    setRows((current) => ({
      ...current,
      [id]: { ticked: current[id]?.ticked ?? false, shopIds: [shopId] },
    }));

  const submit = () => {
    toast.success(ADD_TO_LIST_COPY.added(count));
    onDone();
  };

  return {
    servings,
    factor: servings / recipe.servings,
    lines,
    count,
    changeServings,
    toggleTick,
    toggleShop,
    swapShop,
    submit,
  };
};
