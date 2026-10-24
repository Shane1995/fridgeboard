import type { ComponentType } from 'react';
import { OnboardingSectionId } from '../../services/onboarding/constants';
import { HouseholdStep } from './components/HouseholdStep';
import { NeedsInviteStep } from './components/NeedsInviteStep';
import { UsernameStep } from './components/UsernameStep';

// One view per onboarding section id the server can return. Add a view when adding a section.
export const SECTION_VIEWS: Record<OnboardingSectionId, ComponentType> = {
  [OnboardingSectionId.Username]: UsernameStep,
  [OnboardingSectionId.Household]: HouseholdStep,
  [OnboardingSectionId.NeedsInvite]: NeedsInviteStep,
};
