import type { IEventRuleInput } from '@fridgeboard/contract/events';

export type CreateRuleVariables = { title: string; body: IEventRuleInput };

export type UpdateRuleVariables = { ruleId: string; title: string; body: Record<string, unknown> };

export type DeleteRuleVariables = { ruleId: string; title: string };

export type SkipOccurrenceVariables = { ruleId: string; date: string; title: string };

export type OverrideOccurrenceVariables = {
  ruleId: string;
  date: string;
  title: string;
  body: Record<string, unknown>;
};
