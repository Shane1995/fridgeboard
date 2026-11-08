import type { TableKey } from '@fridgeboard/lambda-kit/utils/keys/types.ts';

export type JoinHouseholdParams = { hhId: string; sub: string; invite: TableKey };
