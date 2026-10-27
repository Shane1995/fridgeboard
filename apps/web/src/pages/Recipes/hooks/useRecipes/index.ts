import { useOverlayState } from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import { useFeatureFlag } from '../../../../hooks/useFeatureFlag';
import { useRecipeBook } from '../../../../hooks/useRecipeBook';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import type { RecipeDraft } from '../../../../services/recipes/types';
import type { RecipeScreen } from '../../types';
import { filterRecipes } from '../../utils/filterRecipes';
import type { UseRecipesOptions } from './types';

export const useRecipes = ({ initialRecipeId, initialUrl }: UseRecipesOptions) => {
  const enabled = useFeatureFlag(WebFeatureFlag.ENABLE_RECIPES);
  const book = useRecipeBook();
  const importDialog = useOverlayState();
  const ideasDialog = useOverlayState();
  const [screen, setScreen] = useState<RecipeScreen>(() =>
    initialRecipeId === undefined
      ? { kind: 'list' }
      : { kind: 'detail', recipeId: initialRecipeId },
  );
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | undefined>(undefined);
  const queuedUrl = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (enabled && initialUrl !== undefined && queuedUrl.current !== initialUrl) {
      queuedUrl.current = initialUrl;
      book.startImport({ source: initialUrl });
    }
  }, [enabled, initialUrl, book]);

  const visibleRecipes = filterRecipes({ recipes: book.recipes, query, tag });
  const current =
    screen.kind === 'detail' || (screen.kind === 'form' && screen.recipeId !== undefined)
      ? book.recipes.find((recipe) => recipe.id === screen.recipeId)
      : undefined;
  const reviewDraft =
    screen.kind === 'review'
      ? book.imports.find((item) => item.id === screen.importId)?.draft
      : undefined;

  const showList = () => setScreen({ kind: 'list' });
  const openRecipe = ({ id }: { id: string }) => setScreen({ kind: 'detail', recipeId: id });
  const startNew = () => setScreen({ kind: 'form', recipeId: undefined });
  const startEdit = ({ id }: { id: string }) => setScreen({ kind: 'form', recipeId: id });
  const reviewImport = ({ id }: { id: string }) => setScreen({ kind: 'review', importId: id });

  const saveRecipe = ({ draft }: { draft: RecipeDraft }) => {
    if (screen.kind === 'review') {
      openRecipe({ id: book.saveImport({ id: screen.importId, draft }) });
      return;
    }
    if (screen.kind === 'form' && screen.recipeId !== undefined) {
      book.updateRecipe({ id: screen.recipeId, draft });
      openRecipe({ id: screen.recipeId });
      return;
    }
    openRecipe({ id: book.createRecipe({ draft }) });
  };

  const cancelForm = () =>
    screen.kind === 'form' && screen.recipeId !== undefined
      ? openRecipe({ id: screen.recipeId })
      : showList();

  const removeRecipe = ({ id }: { id: string }) => {
    book.deleteRecipe({ id });
    showList();
  };

  return {
    enabled,
    screen,
    current,
    reviewDraft,
    imports: book.imports,
    visibleRecipes,
    query,
    setQuery,
    tag,
    setTag,
    importDialog,
    ideasDialog,
    showList,
    openRecipe,
    startNew,
    startEdit,
    reviewImport,
    saveRecipe,
    cancelForm,
    removeRecipe,
    startImport: book.startImport,
    retryImport: book.retryImport,
    discardImport: book.discardImport,
    toggleFavourite: book.toggleFavourite,
  };
};
