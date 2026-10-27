import type { RecipeImport } from '../../../../services/recipes/types';

export type ImportsTrayProps = {
  imports: readonly RecipeImport[];
  onReview: (options: { id: string }) => void;
  onRetry: (options: { id: string }) => void;
  onDiscard: (options: { id: string }) => void;
};
