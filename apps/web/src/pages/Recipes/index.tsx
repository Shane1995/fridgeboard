import { useSearch } from '@tanstack/react-router';
import { PageShell } from '../../components/PageShell';
import { Typography } from '../../components/Typography';
import { RECIPES_COPY } from './constants';
import { AddToListDialog } from './components/AddToListDialog';
import { IdeasDialog } from './components/IdeasDialog';
import { ImportDialog } from './components/ImportDialog';
import { ImportsTray } from './components/ImportsTray';
import { RecipeDetail } from './components/RecipeDetail';
import { RecipeForm } from './components/RecipeForm';
import { RECIPE_FORM_COPY } from './components/RecipeForm/constants';
import { RecipeLibrary } from './components/RecipeLibrary';
import { useRecipes } from './hooks/useRecipes';

export const Recipes = () => {
  const { recipe: initialRecipeId, url: initialUrl } = useSearch({ strict: false });
  const recipes = useRecipes({ initialRecipeId, initialUrl });
  const { screen, current, reviewDraft } = recipes;

  if (!recipes.enabled) {
    return (
      <PageShell title={RECIPES_COPY.title}>
        <Typography>{RECIPES_COPY.placeholder}</Typography>
      </PageShell>
    );
  }

  return (
    <PageShell title={RECIPES_COPY.title}>
      {screen.kind === 'list' && (
        <>
          <ImportsTray
            imports={recipes.imports}
            onReview={recipes.reviewImport}
            onRetry={recipes.retryImport}
            onDiscard={recipes.discardImport}
          />
          <RecipeLibrary
            recipes={recipes.visibleRecipes}
            query={recipes.query}
            tag={recipes.tag}
            onQueryChange={recipes.setQuery}
            onTagChange={recipes.setTag}
            onOpen={recipes.openRecipe}
            onNew={recipes.startNew}
            onImport={recipes.importDialog.open}
            onIdeas={recipes.ideasDialog.open}
            onToggleFavourite={recipes.toggleFavourite}
          />
        </>
      )}
      {screen.kind === 'detail' && current !== undefined && (
        <RecipeDetail
          recipe={current}
          onBack={recipes.showList}
          onAddToList={recipes.addToListDialog.open}
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
          title={
            screen.recipeId === undefined
              ? RECIPE_FORM_COPY.createTitle
              : RECIPE_FORM_COPY.editTitle
          }
          recipe={current}
          onSave={recipes.saveRecipe}
          onCancel={recipes.cancelForm}
        />
      )}
      {screen.kind === 'review' && reviewDraft !== undefined && (
        <RecipeForm
          key={screen.importId}
          title={RECIPE_FORM_COPY.reviewTitle}
          recipe={reviewDraft}
          onSave={recipes.saveRecipe}
          onCancel={recipes.showList}
        />
      )}
      {current !== undefined && (
        <AddToListDialog key={current.id} state={recipes.addToListDialog} recipe={current} />
      )}
      <ImportDialog state={recipes.importDialog} onImport={recipes.startImport} />
      <IdeasDialog state={recipes.ideasDialog} onImport={recipes.startImport} />
    </PageShell>
  );
};
