import type { PlannerLine } from '../../types';

export type AddLineOptions = { sectionId: string };

export type UpdateLineOptions = { sectionId: string; lineId: string; text: string };

export type RemoveLineOptions = { sectionId: string; lineId: string };

export type AddRecipeLineOptions = { sectionId: string; recipeId: string; name: string };

export type SetLineRecipeOptions = AddRecipeLineOptions & { lineId: string };

export type UnlinkRecipeOptions = { sectionId: string; lineId: string };

export type RestoreLineOptions = { sectionId: string; line: PlannerLine; index: number };
