import { Button } from '@heroui/react';
import { Link } from '@tanstack/react-router';
import { BookOpen, Link2, Link2Off, Plus, Trash2, X } from 'lucide-react';
import {
  SHOP_COLOR_CLASSES,
  SHOP_TEXT_CLASSES,
} from '../../../../../../components/ShopSwatch/constants';
import { Typography } from '../../../../../../components/Typography';
import { TypographyVariant } from '../../../../../../components/Typography/constants';
import {
  PLANNER_COPY,
  PLANNER_INPUT_CLASS,
  PLANNER_LINE_MAX_LENGTH,
  PLANNER_TITLE_MAX_LENGTH,
  SECTION_STYLES,
} from '../../constants';
import type { PlannerSectionProps } from './types';

export const PlannerSection = ({
  section,
  color,
  isToday,
  focusId,
  onAddLine,
  onUpdateLine,
  onRemoveLine,
  knownRecipeIds,
  onPickRecipe,
  onUnlinkRecipe,
  onRename,
  onDelete,
}: PlannerSectionProps) => {
  const style = SECTION_STYLES[color];
  return (
    <section
      aria-label={section.title}
      className={`flex flex-col overflow-hidden rounded-2xl border ${style.border} ${style.surface} ${isToday ? 'shadow-lg' : 'shadow-sm'}`}
    >
      <div
        className={`flex items-center justify-between gap-2 px-3 py-2 ${SHOP_COLOR_CLASSES[color]} ${SHOP_TEXT_CLASSES[color]}`}
      >
        {onRename === undefined ? (
          <Typography variant={TypographyVariant.Heading3} as="h3">
            {section.title}
          </Typography>
        ) : (
          <input
            aria-label={PLANNER_COPY.noteTitleLabel}
            maxLength={PLANNER_TITLE_MAX_LENGTH}
            className="w-full min-w-0 rounded-lg bg-transparent px-1 text-lg font-semibold outline-none focus-visible:ring-2 focus-visible:ring-current"
            value={section.title}
            onChange={(event) => onRename({ sectionId: section.id, title: event.target.value })}
          />
        )}
        {isToday && (
          <span className="shrink-0 rounded-full bg-white/30 px-2 py-0.5 text-xs font-semibold">
            {PLANNER_COPY.today}
          </span>
        )}
        {onDelete !== undefined && (
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label={`${PLANNER_COPY.deleteNote} ${section.title}`}
            className="text-current"
            onPress={() => onDelete({ sectionId: section.id })}
          >
            <Trash2 aria-hidden size={18} />
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-2 p-3">
        {section.lines.length === 0 && (
          <Typography variant={TypographyVariant.Caption}>{PLANNER_COPY.emptySection}</Typography>
        )}
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
            {line.recipeId !== undefined && knownRecipeIds.has(line.recipeId) ? (
              <>
                <Link
                  to="/recipes"
                  search={{ recipe: line.recipeId }}
                  aria-label={`${PLANNER_COPY.openRecipe} ${line.text}`}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-accent outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <BookOpen aria-hidden size={18} />
                </Link>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  aria-label={`${PLANNER_COPY.unlinkRecipe} ${line.text}`}
                  onPress={() => onUnlinkRecipe({ sectionId: section.id, lineId: line.id })}
                >
                  <Link2Off aria-hidden size={16} />
                </Button>
              </>
            ) : (
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                aria-label={`${PLANNER_COPY.linkRecipe} ${section.title}`}
                onPress={() => onPickRecipe({ sectionId: section.id, lineId: line.id })}
              >
                <Link2 aria-hidden size={16} />
              </Button>
            )}
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
      </div>
    </section>
  );
};
