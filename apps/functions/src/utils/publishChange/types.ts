import type { IChange } from '@fridgeboard/contract/changes';

export type PublishChangeOptions = { householdId: string; changes: readonly IChange[] };
