import { QUANTITY_DECIMALS } from './constants';
import type { FormatIngredientOptions } from './types';

export const formatIngredient = ({ ingredient, factor = 1 }: FormatIngredientOptions): string =>
  [
    ingredient.quantity === undefined
      ? ''
      : String(Number((ingredient.quantity * factor).toFixed(QUANTITY_DECIMALS))),
    ingredient.unit,
    ingredient.item,
  ]
    .filter((part) => part !== '')
    .join(' ');
