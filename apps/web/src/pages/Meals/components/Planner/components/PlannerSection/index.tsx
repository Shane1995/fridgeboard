import { Button } from '@heroui/react';
import { Link } from '@tanstack/react-router';
import { BookOpen, Link2Off, Plus, X } from 'lucide-react';
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
  SECTION_STYLES,
} from '../../constants';
import type { PlannerSectionProps } from './types';

export const PlannerSection = ({
  section,
  color,
  isToday,
  isSelected = true,
  focusId,
  onAddLine,
  onUpdateLine,
  onRemoveLine,
  recipeIngredientCounts,
  onAddIngredients,
  onPickRecipe,
  onUnlinkRecipe,
}: PlannerSectionProps) => {
  const style = SECTION_STYLES[color];
  return (
    <section
      aria-label={section.title}
      className={`${isSelected ? 'flex' : 'hidden md:flex'} flex-col overflow-hidden rounded-2xl border ${style.border} ${style.surface} ${isToday ? 'shadow-lg' : 'shadow-sm'}`}
    >
      <div
        className={`flex items-center justify-between gap-2 px-3 py-2 ${SHOP_COLOR_CLASSES[color]} ${SHOP_TEXT_CLASSES[color]}`}
      >
        <Typography variant={TypographyVariant.Heading3} as="h3">
          {section.title}
        </Typography>
        {isToday && (
          <span className="shrink-0 rounded-full bg-white/30 px-2 py-0.5 text-xs font-semibold">
            {PLANNER_COPY.today}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2 p-3">
        {section.lines.length === 0 && (
          <Typography variant={TypographyVariant.Caption}>{PLANNER_COPY.emptySection}</Typography>
        )}
        {section.lines.map((line) => (
          <div key={line.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
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
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && line.text.trim() !== '') {
                    event.preventDefault();
                    onAddLine({ sectionId: section.id });
                  }
                }}
              />
              {line.recipeId !== undefined && recipeIngredientCounts.has(line.recipeId) ? (
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
              ) : null}
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
            {line.recipeId !== undefined && recipeIngredientCounts.has(line.recipeId) && (
              <Button
                size="sm"
                variant="secondary"
                className="self-start"
                aria-label={`${PLANNER_COPY.addIngredients} ${line.text}`}
                onPress={() => onAddIngredients({ recipeId: line.recipeId ?? '' })}
              >
                <Plus aria-hidden size={16} />
                {PLANNER_COPY.addIngredients} ({recipeIngredientCounts.get(line.recipeId)})
              </Button>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            aria-label={`${PLANNER_COPY.addLine} ${section.title}`}
            onPress={() => onAddLine({ sectionId: section.id })}
          >
            <Plus aria-hidden size={16} />
            {PLANNER_COPY.addLine}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-label={`${PLANNER_COPY.addRecipe} ${section.title}`}
            onPress={() => onPickRecipe({ sectionId: section.id })}
          >
            <BookOpen aria-hidden size={16} />
            {PLANNER_COPY.addRecipe}
          </Button>
        </div>
      </div>
    </section>
  );
};
