import { act, renderHook } from '@testing-library/react';
import { useRecipeForm } from '.';

const setup = () => {
  const onSave = vi.fn();
  const hook = renderHook(() => useRecipeForm({ recipe: undefined, onSave }));
  return { ...hook, onSave };
};

const submit = () => ({ preventDefault: vi.fn() }) as never;

describe('useRecipeForm', () => {
  it('does not save without a name and an ingredient', () => {
    const { result, onSave } = setup();
    act(() => result.current.handleSubmit(submit()));
    expect(onSave).not.toHaveBeenCalled();

    act(() => result.current.setText({ field: 'name', value: 'Pancakes' }));
    act(() => result.current.handleSubmit(submit()));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('saves a recipe with a name and an ingredient', () => {
    const { result, onSave } = setup();
    const id = result.current.form.ingredients[0]?.id ?? '';
    act(() => result.current.setText({ field: 'name', value: 'Pancakes' }));
    act(() => result.current.setIngredient({ id, field: 'item', value: 'flour' }));
    act(() => result.current.handleSubmit(submit()));
    expect(onSave).toHaveBeenCalledWith({
      draft: expect.objectContaining({ name: 'Pancakes' }),
    });
  });

  it('adds and removes ingredients and steps', () => {
    const { result } = setup();
    act(() => result.current.addIngredient());
    act(() => result.current.addStep());
    expect(result.current.form.ingredients).toHaveLength(2);
    expect(result.current.form.steps).toHaveLength(2);

    const ingredientId = result.current.form.ingredients[0]?.id ?? '';
    const stepId = result.current.form.steps[0]?.id ?? '';
    act(() => result.current.removeIngredient({ id: ingredientId }));
    act(() => result.current.removeStep({ id: stepId }));
    expect(result.current.form.ingredients).toHaveLength(1);
    expect(result.current.form.steps).toHaveLength(1);
  });

  it('toggles a tag on and off', () => {
    const { result } = setup();
    act(() => result.current.toggleTag({ tag: 'quick' }));
    expect(result.current.form.tags).toEqual(['quick']);
    act(() => result.current.toggleTag({ tag: 'quick' }));
    expect(result.current.form.tags).toEqual([]);
  });
});
