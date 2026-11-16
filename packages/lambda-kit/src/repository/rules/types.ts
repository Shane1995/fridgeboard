import type { IEventRule } from '@fridgeboard/contract/events';
import type { HouseholdScope } from '../../utils/resolveHousehold/types.ts';
import type { Table } from '../../utils/table/types.ts';

export type QueryRulesOptions = { table: Table; scope: HouseholdScope };

export type GetRuleOptions = QueryRulesOptions & { ruleId: string };

export type PutRuleOpOptions = { scope: HouseholdScope; rule: IEventRule };

export type DeleteRuleOpOptions = { scope: HouseholdScope; ruleId: string };
