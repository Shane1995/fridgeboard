import { Button } from '@heroui/react';
import { Link } from '@tanstack/react-router';
import { ArrowUpDown, BookOpen, Link2Off, Plus, Replace, X } from 'lucide-react';
import { SHOP_COLOR_CLASSES } from '../../../../../../components/ShopSwatch/constants';
import { formatIngredient } from '../../../../../Recipes/utils/formatIngredient';
import { Typography } from '../../../../../../components/Typography';
import { TypographyVariant } from '../../../../../../components/Typography/constants';
import { PLANNER_COPY, PLANNER_LINE_INPUT_CLASS, PLANNER_LINE_MAX_LENGTH } from '../../constants';
import type { PlannerSectionProps } from './types';

export const PlannerSection = ({
  section,
  color,
  isToday,
  isSelected = true,
  focusId,
  suggestions,
  onAddLine,
  onUpdateLine,
  onRemoveLine,
  onAddRecipe,
  onSwapBackup,
  recipesById,
  onAddIngredients,
  onPickRecipe,
  onUnlinkRecipe,
}: PlannerSectionProps) => {
  const mains = section.lines.filter((line) => !line.isBackup);
  const backups = section.lines.filter((line) => line.isBackup);
  const firstBackupId = backups[0]?.id;
  return (
    <section
      aria-label={section.title}
      className={`${isSelected ? 'flex' : 'hidden md:flex'} flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-white ${isToday ? 'shadow-md' : 'shadow-sm'}`}
    >
      <div className="flex items-center justify-between gap-2 px-4 pt-3">
        <div className="flex items-center gap-2">
          <span aria-hidden className={`size-3 rounded-full ${SHOP_COLOR_CLASSES[color]}`} />
          <Typography variant={TypographyVariant.Heading3} as="h3">
            {section.title}
          </Typography>
        </div>
        {isToday && (
          <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
            {PLANNER_COPY.today}
          </span>
        )}
      </div>
      <div className="flex flex-col divide-y divide-foreground/5 px-4 pb-1">
        {section.lines.length === 0 && (
          <div className="flex flex-col gap-2 py-3">
            <Typography variant={TypographyVariant.Caption}>{PLANNER_COPY.emptySection}</Typography>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((recipe) => (
                  <button
                    key={recipe.id}
                    type="button"
                    aria-label={`${PLANNER_COPY.quickAdd} ${recipe.name} ${section.title}`}
                    onClick={() =>
                      onAddRecipe({
                        sectionId: section.id,
                        recipeId: recipe.id,
                        name: recipe.name,
                      })
                    }
                    className="inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-full border border-foreground/10 px-3 text-sm font-semibold outline-none hover:bg-default focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <Plus aria-hidden size={14} />
                    {recipe.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {[...mains, ...backups].map((line) => {
          const recipe = line.recipeId === undefined ? undefined : recipesById.get(line.recipeId);
          return (
            <div
              key={line.id}
              className={`flex flex-col py-1 ${line.isBackup ? '-mx-4 bg-default/40 px-4' : ''}`}
            >
              {line.id === firstBackupId && (
                <span className="pt-1 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                  {PLANNER_COPY.backupLabel}
                </span>
              )}
              <div className="flex items-center gap-1">
                <input
                  aria-label={`${section.title} ${PLANNER_COPY.lineLabel}`}
                  placeholder={PLANNER_COPY.linePlaceholder}
                  maxLength={PLANNER_LINE_MAX_LENGTH}
                  autoFocus={line.id === focusId}
                  className={PLANNER_LINE_INPUT_CLASS}
                  value={line.text}
                  onChange={(event) =>
                    onUpdateLine({
                      sectionId: section.id,
                      lineId: line.id,
                      text: event.target.value,
                    })
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && line.text.trim() !== '') {
                      event.preventDefault();
                      onAddLine({ sectionId: section.id, isBackup: line.isBackup === true });
                    }
                  }}
                />
                {recipe === undefined && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={`${PLANNER_COPY.linkRecipe} ${line.text}`}
                    onPress={() => onPickRecipe({ sectionId: section.id, lineId: line.id })}
                  >
                    <BookOpen aria-hidden size={16} />
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
              {line.isBackup === true && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mb-2 self-start"
                  aria-label={`${PLANNER_COPY.useInstead} ${line.text}`}
                  onPress={() => onSwapBackup({ sectionId: section.id, lineId: line.id })}
                >
                  <ArrowUpDown aria-hidden size={16} />
                  {PLANNER_COPY.useInstead}
                </Button>
              )}
              {recipe !== undefined && (
                <div className="flex flex-col gap-2 pb-2">
                  {line.isBackup !== true && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      aria-label={`${PLANNER_COPY.addIngredients} ${line.text}`}
                      onPress={() => onAddIngredients({ recipeId: recipe.id })}
                    >
                      <Plus aria-hidden size={16} />
                      {PLANNER_COPY.addIngredients} ({recipe.ingredients.length})
                    </Button>
                  )}
                  <div className="grid grid-cols-3 gap-1">
                    <Link
                      to="/recipes"
                      search={{ recipe: recipe.id }}
                      aria-label={`${PLANNER_COPY.openRecipe} ${line.text}`}
                      className="inline-flex min-h-8 items-center justify-center gap-1 rounded-lg px-2 text-sm font-semibold text-accent outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    >
                      <BookOpen aria-hidden size={16} />
                      {PLANNER_COPY.openShort}
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`${PLANNER_COPY.changeRecipe} ${line.text}`}
                      onPress={() => onPickRecipe({ sectionId: section.id, lineId: line.id })}
                    >
                      <Replace aria-hidden size={16} />
                      {PLANNER_COPY.changeShort}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`${PLANNER_COPY.unlinkRecipe} ${line.text}`}
                      onPress={() => onUnlinkRecipe({ sectionId: section.id, lineId: line.id })}
                    >
                      <Link2Off aria-hidden size={16} />
                      {PLANNER_COPY.unlinkShort}
                    </Button>
                  </div>
                  <details className="rounded-xl bg-default/60 px-3 py-2 text-sm">
                    <summary className="cursor-pointer font-semibold outline-none focus-visible:ring-2 focus-visible:ring-focus">
                      {PLANNER_COPY.recipeDetails}
                    </summary>
                    <ul className="mt-2 list-disc pl-5">
                      {recipe.ingredients.map((ingredient) => (
                        <li key={ingredient.id}>{formatIngredient({ ingredient })}</li>
                      ))}
                    </ul>
                    <ol className="mt-2 list-decimal pl-5">
                      {recipe.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </details>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-1 border-t border-foreground/5 px-2 py-1">
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
        {mains.length > 0 && backups.length === 0 && (
          <Button
            size="sm"
            variant="ghost"
            aria-label={`${PLANNER_COPY.addBackup} ${section.title}`}
            onPress={() => onAddLine({ sectionId: section.id, isBackup: true })}
          >
            <ArrowUpDown aria-hidden size={16} />
            {PLANNER_COPY.addBackup}
          </Button>
        )}
      </div>
    </section>
  );
};
