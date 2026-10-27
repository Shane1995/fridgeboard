import type { DummyMemberId } from '../../constants';

export type BuildDummyEventsOptions = { today: string };

export type DummyEventSpec = {
  offset: number;
  title: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
  ownerId: DummyMemberId | 'household';
  note: string;
};
