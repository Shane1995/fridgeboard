import { Button, useOverlayState } from '@heroui/react';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRecipeBook } from '../../../../hooks/useRecipeBook';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { ShopColor } from '../../../../services/shoppingList/constants';
import { PLANNER_COPY, PLANNER_DAY_COLORS, PLANNER_NOTE_COLOR } from './constants';
import { PlannerSection } from './components/PlannerSection';
import { AddToListDialog } from '../../../Recipes/components/AddToListDialog';
import { RecipePickerDialog } from './components/RecipePickerDialog';
import type { PlannerProps } from './types';

export const Planner = ({
  days,
  notes,
  focusId,
  todayWeekday,
  onAddLine,
  onUpdateLine,
  onRemoveLine,
  onLinkRecipe,
  onUnlinkRecipe,
  onAddNote,
  onRenameNote,
  onDeleteNote,
}: PlannerProps) => {
  const book = useRecipeBook();
  const picker = useOverlayState();
  const [target, setTarget] = useState<{ sectionId: string; lineId: string } | undefined>(
    undefined,
  );
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

  const openPicker = (options: { sectionId: string; lineId: string }) => {
    setTarget(options);
    picker.open();
  };

  const pickRecipe = ({ recipe }: { recipe: { id: string; name: string } }) => {
    if (target !== undefined) {
      onLinkRecipe({ ...target, recipeId: recipe.id, name: recipe.name });
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
      <Typography variant={TypographyVariant.Heading3} as="h2">
        {PLANNER_COPY.notesHeading}
      </Typography>
      <div className="grid gap-3 md:grid-cols-2">
        {notes.map((note) => (
          <PlannerSection
            key={note.id}
            section={note}
            color={PLANNER_NOTE_COLOR}
            isToday={false}
            focusId={focusId}
            onAddLine={onAddLine}
            onUpdateLine={onUpdateLine}
            onRemoveLine={onRemoveLine}
            recipeIngredientCounts={recipeIngredientCounts}
            onAddIngredients={openAddIngredients}
            onPickRecipe={openPicker}
            onUnlinkRecipe={onUnlinkRecipe}
            onRename={onRenameNote}
            onDelete={onDeleteNote}
          />
        ))}
      </div>
      <Button variant="secondary" onPress={onAddNote}>
        <Plus aria-hidden size={18} />
        {PLANNER_COPY.addNote}
      </Button>
      {addRecipe !== undefined && (
        <AddToListDialog key={addRecipe.id} state={addDialog} recipe={addRecipe} />
      )}
      <RecipePickerDialog state={picker} recipes={book.recipes} onPick={pickRecipe} />
    </div>
  );
};
