import { useState } from 'react';
import { useFeatureFlag } from '../../../../hooks/useFeatureFlag';
import { useRecipeBook } from '../../../../hooks/useRecipeBook';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import type { RecipeDraft } from '../../../../services/recipes/types';
import type { RecipeScreen } from '../../types';
import { filterRecipes } from '../../utils/filterRecipes';
import type { UseRecipesOptions } from './types';

export const useRecipes = ({ initialRecipeId }: UseRecipesOptions) => {
  const enabled = useFeatureFlag(WebFeatureFlag.ENABLE_RECIPES);
  const book = useRecipeBook();
  const [screen, setScreen] = useState<RecipeScreen>(() =>
    initialRecipeId === undefined
      ? { kind: 'list' }
      : { kind: 'detail', recipeId: initialRecipeId },
  );
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | undefined>(undefined);

  const visibleRecipes = filterRecipes({ recipes: book.recipes, query, tag });
  const current =
    screen.kind === 'list'
      ? undefined
      : book.recipes.find((recipe) => recipe.id === screen.recipeId);

  const showList = () => setScreen({ kind: 'list' });
  const openRecipe = ({ id }: { id: string }) => setScreen({ kind: 'detail', recipeId: id });
  const startNew = () => setScreen({ kind: 'form', recipeId: undefined });
  const startEdit = ({ id }: { id: string }) => setScreen({ kind: 'form', recipeId: id });

  const saveRecipe = ({ draft }: { draft: RecipeDraft }) => {
    if (screen.kind === 'form' && screen.recipeId !== undefined) {
      book.updateRecipe({ id: screen.recipeId, draft });
      setScreen({ kind: 'detail', recipeId: screen.recipeId });
      return;
    }
    openRecipe({ id: book.createRecipe({ draft }) });
  };

  const cancelForm = () =>
    setScreen(
      screen.kind === 'form' && screen.recipeId !== undefined
        ? { kind: 'detail', recipeId: screen.recipeId }
        : { kind: 'list' },
    );

  const removeRecipe = ({ id }: { id: string }) => {
    book.deleteRecipe({ id });
    showList();
  };

  return {
    enabled,
    screen,
    current,
    visibleRecipes,
    query,
    setQuery,
    tag,
    setTag,
    showList,
    openRecipe,
    startNew,
    startEdit,
    saveRecipe,
    cancelForm,
    removeRecipe,
    toggleFavourite: book.toggleFavourite,
  };
};
