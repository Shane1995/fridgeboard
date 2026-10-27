import { useSearch } from '@tanstack/react-router';
import { PageHeader } from '../../components/PageHeader';
import { Typography } from '../../components/Typography';
import { RECIPES_COPY } from './constants';
import { RecipeDetail } from './components/RecipeDetail';
import { RecipeForm } from './components/RecipeForm';
import { RecipeLibrary } from './components/RecipeLibrary';
import { useRecipes } from './hooks/useRecipes';

export const Recipes = () => {
  const { recipe: initialRecipeId } = useSearch({ strict: false });
  const recipes = useRecipes({ initialRecipeId });
  const { screen, current } = recipes;

  if (!recipes.enabled) {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
        <PageHeader title={RECIPES_COPY.title} />
        <Typography>{RECIPES_COPY.placeholder}</Typography>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4 md:p-6">
      <PageHeader title={RECIPES_COPY.title} />
      {screen.kind === 'list' && (
        <RecipeLibrary
          recipes={recipes.visibleRecipes}
          query={recipes.query}
          tag={recipes.tag}
          onQueryChange={recipes.setQuery}
          onTagChange={recipes.setTag}
          onOpen={recipes.openRecipe}
          onNew={recipes.startNew}
          onToggleFavourite={recipes.toggleFavourite}
        />
      )}
      {screen.kind === 'detail' && current !== undefined && (
        <RecipeDetail
          recipe={current}
          onBack={recipes.showList}
          onEdit={recipes.startEdit}
          onDelete={recipes.removeRecipe}
          onToggleFavourite={recipes.toggleFavourite}
        />
      )}
      {screen.kind === 'detail' && current === undefined && (
        <Typography>{RECIPES_COPY.empty}</Typography>
      )}
      {screen.kind === 'form' && (
        <RecipeForm
          key={screen.recipeId ?? 'new'}
          recipe={current}
          onSave={recipes.saveRecipe}
          onCancel={recipes.cancelForm}
        />
      )}
    </main>
  );
};
