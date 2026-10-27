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
