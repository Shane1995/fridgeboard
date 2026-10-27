import type { UseOverlayStateReturn } from '@heroui/react';
import type { Recipe } from '../../../../services/recipes/types';

export type AddToListDialogProps = { state: UseOverlayStateReturn; recipe: Recipe };
