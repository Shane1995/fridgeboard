import { Button } from '@heroui/react';
import { Link, Plus, Sparkles } from 'lucide-react';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { RECIPE_TAGS } from '../../../../services/recipes/constants';
import { RECIPES_COPY } from '../../constants';
import { RecipeCard } from '../RecipeCard';
import type { RecipeLibraryProps } from './types';

const CHIP_CLASS =
  'cursor-pointer rounded-full border border-separator px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-white';

export const RecipeLibrary = ({
  recipes,
  query,
  tag,
  onQueryChange,
  onTagChange,
  onOpen,
  onNew,
  onImport,
  onIdeas,
  onToggleFavourite,
}: RecipeLibraryProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <input
          type="search"
          aria-label={RECIPES_COPY.searchLabel}
          placeholder={RECIPES_COPY.searchPlaceholder}
          className="block w-full min-w-0 rounded-xl border border-black/10 bg-white/80 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-focus"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <Button variant="primary" onPress={onNew}>
          <Plus aria-hidden size={18} />
          {RECIPES_COPY.newRecipe}
        </Button>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onPress={onImport}>
          <Link aria-hidden size={16} />
          {RECIPES_COPY.importRecipe}
        </Button>
        <Button variant="secondary" onPress={onIdeas}>
          <Sparkles aria-hidden size={16} />
          {RECIPES_COPY.findIdeas}
        </Button>
      </div>
      <div role="group" aria-label={RECIPES_COPY.tagsLabel} className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={tag === undefined}
          onClick={() => onTagChange(undefined)}
          className={CHIP_CLASS}
        >
          {RECIPES_COPY.allTags}
        </button>
        {RECIPE_TAGS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={tag === option}
            onClick={() => onTagChange(tag === option ? undefined : option)}
            className={CHIP_CLASS}
          >
            {option}
          </button>
        ))}
      </div>
      {recipes.length === 0 ? (
        <Typography variant={TypographyVariant.Caption}>{RECIPES_COPY.empty}</Typography>
      ) : (
        <ul className="flex flex-col gap-2">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onOpen={onOpen}
              onToggleFavourite={onToggleFavourite}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
