import { ShopColor } from '../../../../services/shoppingList/constants';

export const PLANNER_COPY = {
  addLine: 'Add line',
  removeLine: 'Remove line',
  lineLabel: 'line',
  linePlaceholder: 'Add a meal',
  addRecipe: 'Add recipe',
  addIngredients: 'Add ingredients',
  dayStrip: 'Days',
  showDay: 'Show',
  changeRecipe: 'Change recipe',
  linkRecipe: 'Link a recipe',
  recipeDetails: 'Ingredients and steps',
  weekGlance: 'Rest of the week',
  addBackup: 'Add backup',
  backupLabel: 'Or if not',
  useInstead: 'Use instead',
  openRecipe: 'Open recipe',
  openShort: 'Open',
  changeShort: 'Change',
  unlinkShort: 'Unlink',
  quickAdd: 'Add',
  unlinkRecipe: 'Unlink recipe',
  pickerTitle: 'Choose a recipe',
  pickerSearch: 'Search recipes',
  pickerEmpty: 'No recipes match.',
  emptySection: 'Nothing planned. Quick add:',
  today: 'Today',
} as const;

export const PLANNER_LINE_MAX_LENGTH = 120;

export const SUGGESTION_COUNT = 3;

export const PLANNER_LINE_INPUT_CLASS =
  'block w-full min-w-0 rounded-lg bg-transparent py-2 text-base outline-none placeholder:text-foreground/40 focus-visible:ring-2 focus-visible:ring-focus';

export const PLANNER_INPUT_CLASS =
  'block w-full min-w-0 rounded-xl border border-black/10 bg-white/80 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-focus';

export const PLANNER_DAY_COLORS: readonly ShopColor[] = [
  ShopColor.Tomato,
  ShopColor.Sky,
  ShopColor.Mint,
  ShopColor.Grape,
  ShopColor.Orange,
  ShopColor.Pink,
  ShopColor.Cyan,
];
