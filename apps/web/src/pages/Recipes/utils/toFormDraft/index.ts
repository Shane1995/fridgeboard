import { RECIPE_DEFAULT_SERVINGS } from '../../../../services/recipes/constants';
import type { RecipeFormDraft } from '../../types';
import type { ToFormDraftOptions } from './types';

export const toFormDraft = ({ recipe }: ToFormDraftOptions): RecipeFormDraft =>
  recipe === undefined
    ? {
        name: '',
        servings: String(RECIPE_DEFAULT_SERVINGS),
        sourceUrl: '',
        photoUrl: '',
        ingredients: [{ id: crypto.randomUUID(), quantity: '', unit: '', item: '' }],
        steps: [{ id: crypto.randomUUID(), text: '' }],
        notes: '',
        tags: [],
      }
    : {
        name: recipe.name,
        servings: String(recipe.servings),
        sourceUrl: recipe.sourceUrl,
        photoUrl: recipe.photoUrl,
        ingredients: recipe.ingredients.map((ingredient) => ({
          id: ingredient.id,
          quantity: ingredient.quantity === undefined ? '' : String(ingredient.quantity),
          unit: ingredient.unit,
          item: ingredient.item,
        })),
        steps: recipe.steps.map((text) => ({ id: crypto.randomUUID(), text })),
        notes: recipe.notes,
        tags: recipe.tags,
      };
