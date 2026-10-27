import { useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { Recipe } from '../../services/recipes/types';
import { MOCK_RECIPES } from './constants';
import { RecipeBookContext } from './context';
import type {
  CreateRecipeOptions,
  RecipeBookApi,
  RecipeIdOptions,
  UpdateRecipeOptions,
} from './types';

export const RecipeBookProvider = ({ children }: PropsWithChildren) => {
  const [recipes, setRecipes] = useState<readonly Recipe[]>(MOCK_RECIPES);

  const api = useMemo<RecipeBookApi>(
    () => ({
      recipes,
      createRecipe: ({ draft }: CreateRecipeOptions) => {
        const id = crypto.randomUUID();
        setRecipes((current) => [...current, { ...draft, id, isFavourite: false }]);
        return id;
      },
      updateRecipe: ({ id, draft }: UpdateRecipeOptions) =>
        setRecipes((current) =>
          current.map((recipe) => (recipe.id === id ? { ...recipe, ...draft } : recipe)),
        ),
      deleteRecipe: ({ id }: RecipeIdOptions) =>
        setRecipes((current) => current.filter((recipe) => recipe.id !== id)),
      toggleFavourite: ({ id }: RecipeIdOptions) =>
        setRecipes((current) =>
          current.map((recipe) =>
            recipe.id === id ? { ...recipe, isFavourite: !recipe.isFavourite } : recipe,
          ),
        ),
    }),
    [recipes],
  );

  return <RecipeBookContext.Provider value={api}>{children}</RecipeBookContext.Provider>;
};
