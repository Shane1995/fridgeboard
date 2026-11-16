import type { IEventErrorReason, IEventRule } from '@fridgeboard/contract/events';

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type RuleFields = DistributiveOmit<IEventRule, 'id' | 'skip'>;

export type ReadRuleInputOptions = { fields: Record<string, unknown>; current?: IEventRule };

export type ReadRuleInputResult = { rule: RuleFields } | { reason: IEventErrorReason };
