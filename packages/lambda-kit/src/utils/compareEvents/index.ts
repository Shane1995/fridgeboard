import type { IEvent } from '@fridgeboard/contract/events';

const startOf = (event: IEvent): string => (event.allDay ? '' : event.startsAt);

export const compareEvents = (a: IEvent, b: IEvent): number =>
  a.startDate.localeCompare(b.startDate) ||
  startOf(a).localeCompare(startOf(b)) ||
  a.id.localeCompare(b.id);
