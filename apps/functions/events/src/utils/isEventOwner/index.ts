import { isMember } from '@fridgeboard/lambda-kit/repository/households/isMember/index.ts';
import { HOUSEHOLD_OWNER_ID } from '../../constants.ts';
import type { IsEventOwnerOptions } from './types.ts';

export const isEventOwner = async ({
  table,
  scope: { householdId },
  ownerId,
}: IsEventOwnerOptions): Promise<boolean> =>
  ownerId === HOUSEHOLD_OWNER_ID || isMember({ table, householdId, sub: ownerId });
