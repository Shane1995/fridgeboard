import { Button, useOverlayState } from '@heroui/react';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useRecipeBook } from '../../../../hooks/useRecipeBook';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { ShopColor } from '../../../../services/shoppingList/constants';
import { PLANNER_COPY, PLANNER_DAY_COLORS, PLANNER_NOTE_COLOR } from './constants';
import { PlannerSection } from './components/PlannerSection';
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
  const knownRecipeIds = new Set(book.recipes.map((recipe) => recipe.id));

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
      <div className="grid gap-3 md:grid-cols-2">
        {days.map((day) => (
          <PlannerSection
            key={day.id}
            section={day}
            color={PLANNER_DAY_COLORS[day.weekday ?? 0] ?? ShopColor.Slate}
            isToday={day.weekday === todayWeekday}
            focusId={focusId}
            onAddLine={onAddLine}
            onUpdateLine={onUpdateLine}
            onRemoveLine={onRemoveLine}
            knownRecipeIds={knownRecipeIds}
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
            knownRecipeIds={knownRecipeIds}
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
      <RecipePickerDialog state={picker} recipes={book.recipes} onPick={pickRecipe} />
    </div>
  );
};
