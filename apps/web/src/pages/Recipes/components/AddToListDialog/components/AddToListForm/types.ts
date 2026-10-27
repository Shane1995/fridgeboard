import type { Recipe } from '../../../../../../services/recipes/types';

export type AddToListFormProps = { recipe: Recipe; onDone: () => void };
