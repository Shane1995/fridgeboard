import { Button } from '@heroui/react';
import { Plus, X } from 'lucide-react';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import {
  RECIPE_NAME_MAX_LENGTH,
  RECIPE_NOTES_MAX_LENGTH,
  RECIPE_STEP_MAX_LENGTH,
  RECIPE_TAGS,
} from '../../../../services/recipes/constants';
import { FORM_INPUT_CLASS, RECIPE_FORM_COPY } from './constants';
import { useRecipeForm } from './hooks/useRecipeForm';
import type { RecipeFormProps } from './types';

export const RecipeForm = ({ title, recipe, onSave, onCancel }: RecipeFormProps) => {
  const {
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
  } = useRecipeForm({ recipe, onSave });

  return (
    <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-5">
      <Typography variant={TypographyVariant.Heading2} as="h2">
        {title}
      </Typography>
      <label className="flex flex-col gap-1 text-sm font-medium">
        {RECIPE_FORM_COPY.nameLabel}
        <input
          required
          maxLength={RECIPE_NAME_MAX_LENGTH}
          className={FORM_INPUT_CLASS}
          value={form.name}
          onChange={(event) => setText({ field: 'name', value: event.target.value })}
        />
      </label>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          {RECIPE_FORM_COPY.servingsLabel}
          <input
            type="number"
            inputMode="numeric"
            min={1}
            className={FORM_INPUT_CLASS}
            value={form.servings}
            onChange={(event) => setText({ field: 'servings', value: event.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          {RECIPE_FORM_COPY.sourceLabel}
          <input
            type="url"
            className={FORM_INPUT_CLASS}
            value={form.sourceUrl}
            onChange={(event) => setText({ field: 'sourceUrl', value: event.target.value })}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium">
        {RECIPE_FORM_COPY.photoLabel}
        <input
          type="url"
          className={FORM_INPUT_CLASS}
          value={form.photoUrl}
          onChange={(event) => setText({ field: 'photoUrl', value: event.target.value })}
        />
      </label>
      <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="mb-1 font-semibold">{RECIPE_FORM_COPY.ingredientsHeading}</legend>
        {form.ingredients.map((ingredient) => (
          <div
            key={ingredient.id}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_auto] items-center gap-2"
          >
            <input
              aria-label={RECIPE_FORM_COPY.quantityLabel}
              inputMode="decimal"
              className={FORM_INPUT_CLASS}
              value={ingredient.quantity}
              onChange={(event) =>
                setIngredient({ id: ingredient.id, field: 'quantity', value: event.target.value })
              }
            />
            <input
              aria-label={RECIPE_FORM_COPY.unitLabel}
              className={FORM_INPUT_CLASS}
              value={ingredient.unit}
              onChange={(event) =>
                setIngredient({ id: ingredient.id, field: 'unit', value: event.target.value })
              }
            />
            <input
              aria-label={RECIPE_FORM_COPY.itemLabel}
              className={FORM_INPUT_CLASS}
              value={ingredient.item}
              onChange={(event) =>
                setIngredient({ id: ingredient.id, field: 'item', value: event.target.value })
              }
            />
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label={RECIPE_FORM_COPY.removeIngredient}
              onPress={() => removeIngredient({ id: ingredient.id })}
            >
              <X aria-hidden size={16} />
            </Button>
          </div>
        ))}
        <Button size="sm" variant="ghost" onPress={addIngredient}>
          <Plus aria-hidden size={16} />
          {RECIPE_FORM_COPY.addIngredient}
        </Button>
      </fieldset>
      <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="mb-1 font-semibold">{RECIPE_FORM_COPY.stepsHeading}</legend>
        {form.steps.map((step) => (
          <div key={step.id} className="flex items-center gap-2">
            <input
              aria-label={RECIPE_FORM_COPY.stepLabel}
              maxLength={RECIPE_STEP_MAX_LENGTH}
              className={FORM_INPUT_CLASS}
              value={step.text}
              onChange={(event) => setStep({ id: step.id, value: event.target.value })}
            />
            <Button
              isIconOnly
              size="sm"
              variant="ghost"
              aria-label={RECIPE_FORM_COPY.removeStep}
              onPress={() => removeStep({ id: step.id })}
            >
              <X aria-hidden size={16} />
            </Button>
          </div>
        ))}
        <Button size="sm" variant="ghost" onPress={addStep}>
          <Plus aria-hidden size={16} />
          {RECIPE_FORM_COPY.addStep}
        </Button>
      </fieldset>
      <label className="flex flex-col gap-1 text-sm font-medium">
        {RECIPE_FORM_COPY.notesLabel}
        <input
          maxLength={RECIPE_NOTES_MAX_LENGTH}
          className={FORM_INPUT_CLASS}
          value={form.notes}
          onChange={(event) => setText({ field: 'notes', value: event.target.value })}
        />
      </label>
      <div role="group" aria-label={RECIPE_FORM_COPY.tagsLabel} className="flex flex-wrap gap-2">
        {RECIPE_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={form.tags.includes(tag)}
            onClick={() => toggleTag({ tag })}
            className="cursor-pointer rounded-full border border-separator px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-white"
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="primary">
          {RECIPE_FORM_COPY.save}
        </Button>
        <Button variant="secondary" onPress={onCancel}>
          {RECIPE_FORM_COPY.cancel}
        </Button>
      </div>
    </form>
  );
};
