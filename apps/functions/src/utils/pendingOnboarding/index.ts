import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IOnboardingSection } from '@fridgeboard/contract/onboarding';
import { buildOnboarding } from '../buildOnboarding/index.ts';
import { fetchMemberships } from '../fetchMemberships/index.ts';
import { householdRoles } from '../householdRoles/index.ts';
import type { PendingOnboardingInput } from './types.ts';

export const pendingOnboarding = async (
  client: DynamoDBDocumentClient,
  TableName: string | undefined,
  { sub, profile, isAdmin }: PendingOnboardingInput,
): Promise<IOnboardingSection[]> =>
  buildOnboarding({
    username: profile.username,
    canCreateHousehold: profile.canCreateHousehold,
    isAdmin,
    hasHousehold: householdRoles(await fetchMemberships(client, TableName, sub)).size > 0,
  });
