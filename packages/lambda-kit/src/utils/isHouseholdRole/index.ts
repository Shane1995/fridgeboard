import type { HouseholdRole as ContractRole } from '@fridgeboard/contract/households';
import { HouseholdRole } from './constants.ts';

export const isHouseholdRole = (value: unknown): value is ContractRole =>
  Object.values<unknown>(HouseholdRole).includes(value);
