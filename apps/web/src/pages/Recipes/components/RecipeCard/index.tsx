import { ChefHat, Star } from 'lucide-react';
import { RECIPES_COPY } from '../../constants';
import type { RecipeCardProps } from './types';

export const RecipeCard = ({ recipe, onOpen, onToggleFavourite }: RecipeCardProps) => {
  return (
    <li className="flex items-center gap-2 rounded-2xl bg-white/70 pr-2 shadow-sm">
      <button
        type="button"
        aria-label={`${RECIPES_COPY.open} ${recipe.name}`}
        onClick={() => onOpen({ id: recipe.id })}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-2xl p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
          <ChefHat aria-hidden size={24} />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-semibold">{recipe.name}</span>
          <span className="truncate text-xs opacity-60">
            {RECIPES_COPY.serves} {recipe.servings}
            {recipe.tags.length > 0 && ` · ${recipe.tags.join(', ')}`}
          </span>
        </span>
      </button>
      <button
        type="button"
        aria-label={recipe.isFavourite ? RECIPES_COPY.favouriteOn : RECIPES_COPY.favouriteOff}
        aria-pressed={recipe.isFavourite}
        onClick={() => onToggleFavourite({ id: recipe.id })}
        className="cursor-pointer rounded-full p-2 outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <Star
          aria-hidden
          size={22}
          className={recipe.isFavourite ? 'fill-warning text-warning' : 'opacity-40'}
        />
      </button>
    </li>
  );
};
