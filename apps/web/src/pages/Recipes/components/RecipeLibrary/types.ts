import type { Recipe } from '../../../../services/recipes/types';

export type RecipeLibraryProps = {
  recipes: readonly Recipe[];
  query: string;
  tag: string | undefined;
  onQueryChange: (query: string) => void;
  onTagChange: (tag: string | undefined) => void;
  onOpen: (options: { id: string }) => void;
  onNew: () => void;
  onImport: () => void;
  onIdeas: () => void;
  onToggleFavourite: (options: { id: string }) => void;
};
