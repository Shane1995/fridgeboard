import type { ToRulePatchOptions } from './types';

// What "change all of these" sends: only what every occurrence shares. When the series starts and
// how it repeats are left as they are, so changing a title never moves the bin day.
export const toRulePatch = ({ draft }: ToRulePatchOptions): Record<string, unknown> => ({
  title: draft.title.trim(),
  note: draft.note.trim(),
  ownerId: draft.ownerId,
  color: draft.color ?? null,
  reminder: draft.reminder ?? null,
  allDay: draft.allDay,
  ...(draft.allDay ? {} : { startTime: draft.startTime, endTime: draft.endTime }),
});
