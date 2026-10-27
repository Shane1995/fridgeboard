import type { Recipe } from '../../../../../../../../services/recipes/types';

export type UseAddToListOptions = { recipe: Recipe; onDone: () => void };

export type RowState = { ticked: boolean; shopIds: string[] };

export type IngredientIdOptions = { id: string };

export type ToggleShopOptions = { id: string; shopId: string };
