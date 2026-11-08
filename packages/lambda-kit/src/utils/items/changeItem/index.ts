import { CHANGE_TYPES } from '@fridgeboard/contract/changes/constants';
import * as z from 'zod/mini';

// HH#<id> / CHG#<rev>
export const ChangeItemSchema = z.looseObject({
  rev: z.number(),
  type: z.enum(CHANGE_TYPES),
  id: z.string(),
});
