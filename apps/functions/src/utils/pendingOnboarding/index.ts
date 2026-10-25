import type { IOnboardingSection } from '@fridgeboard/contract/onboarding';
import { buildOnboarding } from '../buildOnboarding/index.ts';
import { fetchMemberships } from '../fetchMemberships/index.ts';
import { householdRoles } from '../householdRoles/index.ts';
import type { Table } from '../table/types.ts';
import type { PendingOnboardingInput } from './types.ts';

export const pendingOnboarding = async (
  table: Table,
  { sub, profile, isAdmin }: PendingOnboardingInput,
): Promise<IOnboardingSection[]> =>
  buildOnboarding({
    username: profile.username,
    canCreateHousehold: profile.canCreateHousehold,
    isAdmin,
    hasHousehold: householdRoles(await fetchMemberships(table, sub)).size > 0,
    skippedSections: profile.skippedSections,
  });
