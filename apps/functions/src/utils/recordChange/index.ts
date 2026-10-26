import type { IChange } from '@fridgeboard/contract/changes';
import { commitChange } from '../commitChange/index.ts';
import type { CommitChangeOptions } from '../commitChange/types.ts';
import { publishChange } from '../publishChange/index.ts';

export const recordChange = async (options: CommitChangeOptions): Promise<IChange[]> => {
  const changes = await commitChange(options);
  await publishChange({ householdId: options.householdId, changes });
  return changes;
};
