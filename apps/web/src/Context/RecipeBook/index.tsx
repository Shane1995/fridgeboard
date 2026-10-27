import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { useToast } from '../../hooks/useToast';
import type { Recipe, RecipeImport } from '../../services/recipes/types';
import {
  IMPORT_FAILED_REASON,
  IMPORTED_TOAST,
  MOCK_PARSE_DELAY_MS,
  MOCK_RECIPES,
} from './constants';
import { RecipeBookContext } from './context';
import type {
  CreateRecipeOptions,
  RecipeBookApi,
  RecipeIdOptions,
  SaveImportOptions,
  StartImportOptions,
  UpdateRecipeOptions,
} from './types';
import { buildImportLabel } from './utils/buildImportLabel';
import { buildMockDraft } from './utils/buildMockDraft';

export const RecipeBookProvider = ({ children }: PropsWithChildren) => {
  const toast = useToast();
  const [recipes, setRecipes] = useState<readonly Recipe[]>(MOCK_RECIPES);
  const [imports, setImports] = useState<readonly RecipeImport[]>([]);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const scheduleParse = useCallback(
    ({ id, source }: { id: string; source: string }) => {
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        const draft = buildMockDraft({ source });
        setImports((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: draft === undefined ? 'failed' : 'ready',
                  draft,
                  reason: draft === undefined ? IMPORT_FAILED_REASON : undefined,
                }
              : item,
          ),
        );
        if (draft !== undefined) {
          toast.success(`${IMPORTED_TOAST} ${draft.name}`);
        }
      }, MOCK_PARSE_DELAY_MS);
      timers.current.add(timer);
    },
    [toast],
  );

  const api = useMemo<RecipeBookApi>(
    () => ({
      recipes,
      imports,
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
      startImport: ({ source }: StartImportOptions) => {
        const existing = imports.find((item) => item.source === source && item.status !== 'failed');
        if (existing !== undefined) {
          return existing.id;
        }
        const id = crypto.randomUUID();
        setImports((current) => [
          ...current,
          {
            id,
            source,
            label: buildImportLabel({ source }),
            status: 'parsing',
            draft: undefined,
            reason: undefined,
          },
        ]);
        scheduleParse({ id, source });
        return id;
      },
      retryImport: ({ id }: RecipeIdOptions) => {
        const target = imports.find((item) => item.id === id);
        if (target === undefined) {
          return;
        }
        setImports((current) =>
          current.map((item) =>
            item.id === id ? { ...item, status: 'parsing', reason: undefined } : item,
          ),
        );
        scheduleParse({ id, source: target.source });
      },
      discardImport: ({ id }: RecipeIdOptions) =>
        setImports((current) => current.filter((item) => item.id !== id)),
      saveImport: ({ id, draft }: SaveImportOptions) => {
        const recipeId = crypto.randomUUID();
        setRecipes((current) => [...current, { ...draft, id: recipeId, isFavourite: false }]);
        setImports((current) => current.filter((item) => item.id !== id));
        return recipeId;
      },
    }),
    [recipes, imports, scheduleParse],
  );

  return <RecipeBookContext.Provider value={api}>{children}</RecipeBookContext.Provider>;
};
