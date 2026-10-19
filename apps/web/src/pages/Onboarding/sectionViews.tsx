import type { OnboardingSectionId } from '@fridgeboard/contract/me';
import type { ComponentType } from 'react';
import { HouseholdStep } from './components/HouseholdStep';
import { NeedsInviteStep } from './components/NeedsInviteStep';
import { UsernameStep } from './components/UsernameStep';

// One view per onboarding section id the server can return. Add a view when adding a section.
export const SECTION_VIEWS: Record<OnboardingSectionId, ComponentType> = {
  username: UsernameStep,
  household: HouseholdStep,
  'needs-invite': NeedsInviteStep,
};
