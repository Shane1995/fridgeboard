import { useOverlayState } from '@heroui/react';
import { useState } from 'react';
import { useRecipeBook } from '../../../../hooks/useRecipeBook';
import { ShopColor } from '../../../../services/shoppingList/constants';
import { PLANNER_COPY, PLANNER_DAY_COLORS } from './constants';
import { PlannerSection } from './components/PlannerSection';
import { AddToListDialog } from '../../../Recipes/components/AddToListDialog';
import { RecipePickerDialog } from './components/RecipePickerDialog';
import type { PlannerProps } from './types';

export const Planner = ({
  days,
  focusId,
  todayWeekday,
  onAddLine,
  onUpdateLine,
  onRemoveLine,
  onAddRecipeLine,
  onUnlinkRecipe,
}: PlannerProps) => {
  const book = useRecipeBook();
  const picker = useOverlayState();
  const [target, setTarget] = useState<{ sectionId: string } | undefined>(undefined);
  const addDialog = useOverlayState();
  const [addRecipeId, setAddRecipeId] = useState<string | undefined>(undefined);
  const [selectedWeekday, setSelectedWeekday] = useState(todayWeekday);
  const recipeIngredientCounts = new Map(
    book.recipes.map((recipe) => [recipe.id, recipe.ingredients.length]),
  );
  const addRecipe = book.recipes.find((recipe) => recipe.id === addRecipeId);

  const openAddIngredients = ({ recipeId }: { recipeId: string }) => {
    setAddRecipeId(recipeId);
    addDialog.open();
  };

  const openPicker = (options: { sectionId: string }) => {
    setTarget(options);
    picker.open();
  };

  const pickRecipe = ({ recipe }: { recipe: { id: string; name: string } }) => {
    if (target !== undefined) {
      onAddRecipeLine({ ...target, recipeId: recipe.id, name: recipe.name });
    }
    picker.close();
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label={PLANNER_COPY.dayStrip}
        className="grid grid-cols-7 gap-1 md:hidden"
      >
        {days.map((day) => (
          <button
            key={day.id}
            type="button"
            aria-label={`${PLANNER_COPY.showDay} ${day.title}`}
            aria-pressed={day.weekday === selectedWeekday}
            onClick={() => setSelectedWeekday(day.weekday ?? 0)}
            className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-focus aria-pressed:bg-accent aria-pressed:text-accent-foreground"
          >
            {day.title.slice(0, 1)}
            <span
              aria-hidden
              className={`size-1.5 rounded-full ${day.lines.some((line) => line.text.trim() !== '') ? 'bg-current' : 'bg-transparent'}`}
            />
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {days.map((day) => (
          <PlannerSection
            key={day.id}
            section={day}
            color={PLANNER_DAY_COLORS[day.weekday ?? 0] ?? ShopColor.Slate}
            isToday={day.weekday === todayWeekday}
            isSelected={day.weekday === selectedWeekday}
            focusId={focusId}
            onAddLine={onAddLine}
            onUpdateLine={onUpdateLine}
            onRemoveLine={onRemoveLine}
            recipeIngredientCounts={recipeIngredientCounts}
            onAddIngredients={openAddIngredients}
            onPickRecipe={openPicker}
            onUnlinkRecipe={onUnlinkRecipe}
          />
        ))}
      </div>
      {addRecipe !== undefined && (
        <AddToListDialog key={addRecipe.id} state={addDialog} recipe={addRecipe} />
      )}
      <RecipePickerDialog state={picker} recipes={book.recipes} onPick={pickRecipe} />
    </div>
  );
};
