import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { ShopColor } from '../../../../services/shoppingList/constants';
import { PLANNER_COPY, PLANNER_DAY_COLORS, PLANNER_NOTE_COLOR } from './constants';
import { PlannerSection } from './components/PlannerSection';
import type { PlannerProps } from './types';

export const Planner = ({
  days,
  notes,
  focusId,
  todayWeekday,
  onAddLine,
  onUpdateLine,
  onRemoveLine,
  onAddNote,
  onRenameNote,
  onDeleteNote,
}: PlannerProps) => {
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
            onRename={onRenameNote}
            onDelete={onDeleteNote}
          />
        ))}
      </div>
      <Button variant="secondary" onPress={onAddNote}>
        <Plus aria-hidden size={18} />
        {PLANNER_COPY.addNote}
      </Button>
    </div>
  );
};
