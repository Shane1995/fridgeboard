import type { PlannerSection } from '../../types';

export type UpdateSectionOptions = {
  sections: readonly PlannerSection[];
  sectionId: string;
  update: (section: PlannerSection) => PlannerSection;
};
