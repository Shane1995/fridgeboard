import type { RecipeIdea } from '../../../../services/recipes/types';
import { DESSERT_IDEAS, DESSERT_WORDS, DINNER_IDEAS } from './constants';
import type { BuildMockIdeasOptions } from './types';

export const buildMockIdeas = ({ prompt }: BuildMockIdeasOptions): RecipeIdea[] => {
  const text = prompt.trim().toLowerCase();
  if (text === '') {
    return [];
  }
  return DESSERT_WORDS.some((word) => text.includes(word)) ? [...DESSERT_IDEAS] : [...DINNER_IDEAS];
};
