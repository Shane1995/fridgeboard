import { ID_PATTERN } from '@fridgeboard/lambda-kit/utils/resolveList/constants.ts';
import { readText } from '@fridgeboard/lambda-kit/utils/readText/index.ts';
import { EVENT_NOTE_MAX_LENGTH, EVENT_TITLE_MAX_LENGTH } from '../../constants.ts';
import { readEventExtras } from '../readEventExtras/index.ts';
import type { ReadEventBasicsOptions, ReadEventBasicsResult } from './types.ts';

// The fields an event and a repeat rule share: title, note, owner, colour and reminder.
export const readEventBasics = ({ merged }: ReadEventBasicsOptions): ReadEventBasicsResult => {
  const title = readText({ value: merged.title, maxLength: EVENT_TITLE_MAX_LENGTH });
  if (title === undefined) {
    return { reason: 'invalid-title' };
  }
  const note = merged.note ?? '';
  if (typeof note !== 'string' || note.length > EVENT_NOTE_MAX_LENGTH) {
    return { reason: 'invalid-note' };
  }
  const ownerId = merged.ownerId;
  if (typeof ownerId !== 'string' || !ID_PATTERN.test(ownerId)) {
    return { reason: 'invalid-owner' };
  }
  const extras = readEventExtras({ fields: merged });
  if ('reason' in extras) {
    return { reason: extras.reason };
  }
  return { basics: { title, note, ownerId, ...extras.extras } };
};
