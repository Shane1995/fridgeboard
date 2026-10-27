import type { PlannerSection } from '../../types';
import type { UpdateSectionOptions } from './types';

export const updateSection = ({
  sections,
  sectionId,
  update,
}: UpdateSectionOptions): PlannerSection[] =>
  sections.map((section) => (section.id === sectionId ? update(section) : section));
