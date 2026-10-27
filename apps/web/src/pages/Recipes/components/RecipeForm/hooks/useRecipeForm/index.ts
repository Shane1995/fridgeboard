import { useState } from 'react';
import type { FormEvent } from 'react';
import type { RecipeFormDraft } from '../../../../types';
import { buildRecipeDraft } from '../../../../utils/buildRecipeDraft';
import { toFormDraft } from '../../../../utils/toFormDraft';
import type {
  RemoveOptions,
  SetIngredientOptions,
  SetStepOptions,
  SetTextOptions,
  ToggleTagOptions,
  UseRecipeFormOptions,
} from './types';

export const useRecipeForm = ({ recipe, onSave }: UseRecipeFormOptions) => {
  const [form, setForm] = useState<RecipeFormDraft>(() => toFormDraft({ recipe }));

  const setText = ({ field, value }: SetTextOptions) =>
    setForm((current) => ({ ...current, [field]: value }));

  const setIngredient = ({ id, field, value }: SetIngredientOptions) =>
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient,
      ),
    }));

  const addIngredient = () =>
    setForm((current) => ({
      ...current,
      ingredients: [
        ...current.ingredients,
        { id: crypto.randomUUID(), quantity: '', unit: '', item: '' },
      ],
    }));

  const removeIngredient = ({ id }: RemoveOptions) =>
    setForm((current) => ({
      ...current,
      ingredients: current.ingredients.filter((ingredient) => ingredient.id !== id),
    }));

  const setStep = ({ id, value }: SetStepOptions) =>
    setForm((current) => ({
      ...current,
      steps: current.steps.map((step) => (step.id === id ? { ...step, text: value } : step)),
    }));

  const addStep = () =>
    setForm((current) => ({
      ...current,
      steps: [...current.steps, { id: crypto.randomUUID(), text: '' }],
    }));

  const removeStep = ({ id }: RemoveOptions) =>
    setForm((current) => ({
      ...current,
      steps: current.steps.filter((step) => step.id !== id),
    }));

  const toggleTag = ({ tag }: ToggleTagOptions) =>
    setForm((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((existing) => existing !== tag)
        : [...current.tags, tag],
    }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const draft = buildRecipeDraft({ form });
    if (draft.name === '' || draft.ingredients.length === 0) {
      return;
    }
    onSave({ draft });
  };

  return {
    form,
    setText,
    setIngredient,
    addIngredient,
    removeIngredient,
    setStep,
    addStep,
    removeStep,
    toggleTag,
    handleSubmit,
  };
};
