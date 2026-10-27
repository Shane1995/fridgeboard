import { MOCK_RECIPES } from '../../../../Context/RecipeBook/constants';
import { toFormDraft } from '.';

describe('toFormDraft', () => {
  it('starts a blank recipe with one empty ingredient and step', () => {
    const draft = toFormDraft({ recipe: undefined });
    expect(draft.name).toBe('');
    expect(draft.servings).toBe('4');
    expect(draft.ingredients).toHaveLength(1);
    expect(draft.steps).toHaveLength(1);
  });

  it('turns a recipe into editable text fields', () => {
    const recipe = MOCK_RECIPES[0];
    const draft = toFormDraft({ recipe });
    expect(draft.name).toBe(recipe?.name);
    expect(draft.servings).toBe(String(recipe?.servings));
    expect(draft.ingredients[0]).toMatchObject({ quantity: '500', unit: 'g', item: 'beef mince' });
    expect(draft.steps.map((step) => step.text)).toEqual(recipe?.steps);
  });
});
