import type { Recipe } from '../../services/recipes/types';
import type { FilterRecipesOptions } from './types';

export const filterRecipes = ({ recipes, query, tag }: FilterRecipesOptions): Recipe[] => {
  const needle = query.trim().toLowerCase();
  return recipes
    .filter((recipe) => tag === undefined || recipe.tags.includes(tag))
    .filter(
      (recipe) =>
        needle === '' ||
        recipe.name.toLowerCase().includes(needle) ||
        recipe.ingredients.some((ingredient) => ingredient.item.toLowerCase().includes(needle)),
    )
    .sort((left, right) => Number(right.isFavourite) - Number(left.isFavourite));
};
