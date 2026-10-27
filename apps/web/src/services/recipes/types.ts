import type { ShopColor } from '../shoppingList/constants';

export type RecipeIngredient = {
  id: string;
  quantity: number | undefined;
  unit: string;
  item: string;
};

export type Recipe = {
  id: string;
  name: string;
  sourceUrl: string;
  photoUrl: string;
  servings: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  notes: string;
  tags: string[];
  isFavourite: boolean;
};

export type RecipeDraft = Omit<Recipe, 'id' | 'isFavourite'>;

export type RecipeImportStatus = 'parsing' | 'ready' | 'failed';

export type RecipeImport = {
  id: string;
  source: string;
  label: string;
  status: RecipeImportStatus;
  draft: RecipeDraft | undefined;
  reason: string | undefined;
};

export type RecipeShop = { id: string; name: string; color: ShopColor };

export type ShopSuggestion = {
  shopId: string;
  alternativeShopIds: string[];
  isStaple: boolean;
};

export type RecipeIdea = {
  id: string;
  title: string;
  site: string;
  snippet: string;
  url: string;
};
