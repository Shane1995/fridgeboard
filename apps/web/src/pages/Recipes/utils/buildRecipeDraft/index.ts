import { RECIPE_DEFAULT_SERVINGS } from '../../../../services/recipes/constants';
import type { RecipeDraft } from '../../../../services/recipes/types';
import type { BuildRecipeDraftOptions } from './types';

const toQuantity = ({ text }: { text: string }): number | undefined => {
  const value = Number(text);
  return text.trim() === '' || !Number.isFinite(value) ? undefined : value;
};

export const buildRecipeDraft = ({ form }: BuildRecipeDraftOptions): RecipeDraft => {
  const servings = Number(form.servings);
  return {
    name: form.name.trim(),
    sourceUrl: form.sourceUrl.trim(),
    photoUrl: form.photoUrl.trim(),
    servings: Number.isInteger(servings) && servings > 0 ? servings : RECIPE_DEFAULT_SERVINGS,
    ingredients: form.ingredients
      .filter((ingredient) => ingredient.item.trim() !== '')
      .map((ingredient) => ({
        id: ingredient.id,
        quantity: toQuantity({ text: ingredient.quantity }),
        unit: ingredient.unit.trim(),
        item: ingredient.item.trim(),
      })),
    steps: form.steps.map((step) => step.text.trim()).filter((text) => text !== ''),
    notes: form.notes.trim(),
    tags: form.tags,
  };
};
