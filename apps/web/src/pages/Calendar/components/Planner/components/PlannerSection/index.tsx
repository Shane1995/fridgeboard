import { Button } from '@heroui/react';
import { Plus, Trash2, X } from 'lucide-react';
import { Typography } from '../../../../../../components/Typography';
import { TypographyVariant } from '../../../../../../components/Typography/constants';
import {
  PLANNER_COPY,
  PLANNER_INPUT_CLASS,
  PLANNER_LINE_MAX_LENGTH,
  PLANNER_TITLE_MAX_LENGTH,
} from '../../constants';
import type { PlannerSectionProps } from './types';

export const PlannerSection = ({
  section,
  focusId,
  onAddLine,
  onUpdateLine,
  onRemoveLine,
  onRename,
  onDelete,
}: PlannerSectionProps) => {
  return (
    <section
      aria-label={section.title}
      className="flex flex-col gap-2 rounded-2xl border border-separator p-3"
    >
      <div className="flex items-center justify-between gap-2">
        {onRename === undefined ? (
          <Typography variant={TypographyVariant.Heading3} as="h3">
            {section.title}
          </Typography>
        ) : (
          <input
            aria-label={PLANNER_COPY.noteTitleLabel}
            maxLength={PLANNER_TITLE_MAX_LENGTH}
            className={`${PLANNER_INPUT_CLASS} font-semibold`}
            value={section.title}
            onChange={(event) => onRename({ sectionId: section.id, title: event.target.value })}
          />
        )}
        {onDelete !== undefined && (
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label={`${PLANNER_COPY.deleteNote} ${section.title}`}
            onPress={() => onDelete({ sectionId: section.id })}
          >
            <Trash2 aria-hidden size={18} />
          </Button>
        )}
      </div>
      {section.lines.map((line) => (
        <div key={line.id} className="flex items-center gap-2">
          <input
            aria-label={`${section.title} ${PLANNER_COPY.lineLabel}`}
            placeholder={PLANNER_COPY.linePlaceholder}
            maxLength={PLANNER_LINE_MAX_LENGTH}
            autoFocus={line.id === focusId}
            className={PLANNER_INPUT_CLASS}
            value={line.text}
            onChange={(event) =>
              onUpdateLine({ sectionId: section.id, lineId: line.id, text: event.target.value })
            }
          />
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label={`${PLANNER_COPY.removeLine} ${line.text}`}
            onPress={() => onRemoveLine({ sectionId: section.id, lineId: line.id })}
          >
            <X aria-hidden size={16} />
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        variant="ghost"
        aria-label={`${PLANNER_COPY.addLine} ${section.title}`}
        onPress={() => onAddLine({ sectionId: section.id })}
      >
        <Plus aria-hidden size={16} />
        {PLANNER_COPY.addLine}
      </Button>
    </section>
  );
};
