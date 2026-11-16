import type { IEventRule } from '@fridgeboard/contract/events';

export type ExpandRuleOptions = { rule: IEventRule; from: string; to: string };

export type MatchesRuleOptions = { rule: IEventRule; date: string };
