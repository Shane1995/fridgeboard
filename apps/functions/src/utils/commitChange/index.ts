import type { IChange } from '@fridgeboard/contract/changes';
import { buildRevCondition } from '../buildRevCondition/index.ts';
import { HouseholdMetaItemSchema } from '../items/householdMetaItem/index.ts';
import { isRevConflict } from '../isRevConflict/index.ts';
import { changeKey } from '../keys/changeKey/index.ts';
import { householdMetaKey } from '../keys/householdMetaKey/index.ts';
import { retryDelay } from '../retryDelay/index.ts';
import { sleep } from '../sleep/index.ts';
import {
  CHANGE_TTL_SECONDS,
  COMMIT_MAX_ATTEMPTS,
  HOUSEHOLD_MISSING_ERROR,
  REV_CONFLICT_ERROR,
} from './constants.ts';
import type { CommitChangeOptions } from './types.ts';

export const commitChange = async ({
  table,
  householdId,
  type,
  id,
  items,
}: CommitChangeOptions): Promise<IChange> => {
  const metaKey = householdMetaKey(householdId);

  const run = async ({ attempt }: { attempt: number }): Promise<IChange> => {
    const meta = await table.get(metaKey, HouseholdMetaItemSchema);
    if (meta === undefined) {
      throw new Error(HOUSEHOLD_MISSING_ERROR);
    }
    const current = meta.rev ?? 0;
    const rev = current + 1;
    const ttl = Math.floor(Date.now() / 1000) + CHANGE_TTL_SECONDS;

    try {
      await table.transactWrite([
        ...items,
        { update: metaKey, parts: { set: { rev } }, condition: buildRevCondition({ current }) },
        { put: { ...changeKey({ householdId, rev }), rev, type, id, ttl } },
      ]);
      return { id, rev, type };
    } catch (error) {
      if (!isRevConflict({ error, index: items.length })) {
        throw error;
      }
      if (attempt >= COMMIT_MAX_ATTEMPTS) {
        throw new Error(REV_CONFLICT_ERROR);
      }
      await sleep({ ms: retryDelay({ attempt }) });
      return run({ attempt: attempt + 1 });
    }
  };

  return run({ attempt: 1 });
};
