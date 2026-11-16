import type { HouseholdScope } from '@fridgeboard/lambda-kit/utils/resolveHousehold/types.ts';
import type { Table } from '@fridgeboard/lambda-kit/utils/table/types.ts';

export type IsEventOwnerOptions = { table: Table; scope: HouseholdScope; ownerId: string };
