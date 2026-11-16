export type PlannerLine = {
  id: string;
  text: string;
  recipeId?: string | undefined;
  isBackup?: boolean | undefined;
};

export type PlannerSection = {
  id: string;
  title: string;
  lines: PlannerLine[];
  weekday?: number | undefined;
};

export type PlannerPlan = { days: PlannerSection[] };
