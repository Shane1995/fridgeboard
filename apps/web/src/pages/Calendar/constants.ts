import { ShopColor } from '../../services/shoppingList/constants';
import type { CalendarMember } from './types';

export enum CalendarView {
  Month = 'month',
  Week = 'week',
}

export enum DummyMemberId {
  Shane = 'shane',
  Partner = 'partner',
}

export const CALENDAR_TIME_ZONE = 'Europe/London';
export const WEEK_STARTS_ON = 0;
export const DAYS_PER_WEEK = 7;
export const HOUSEHOLD_OWNER_ID = 'household';
export const EVENT_TITLE_MAX_LENGTH = 80;
export const EVENT_NOTE_MAX_LENGTH = 500;
export const MAX_CHIPS_PER_DAY = 2;
export const DEFAULT_START_TIME = '09:00';
export const DEFAULT_END_TIME = '10:00';

export const HOUSEHOLD_OWNER: CalendarMember = {
  id: HOUSEHOLD_OWNER_ID,
  name: 'Household',
  color: ShopColor.Slate,
};

const DUMMY_MEMBERS: readonly CalendarMember[] = [
  { id: DummyMemberId.Shane, name: 'Shane', color: ShopColor.Tomato },
  { id: DummyMemberId.Partner, name: 'Partner', color: ShopColor.Sky },
];

export const OWNER_OPTIONS: readonly CalendarMember[] = [HOUSEHOLD_OWNER, ...DUMMY_MEMBERS];

export const CALENDAR_COPY = {
  title: 'Calendar',
  placeholder: 'Coming soon: shifts and meals on a calendar.',
  previous: 'Previous',
  next: 'Next',
  today: 'Today',
  month: 'Month',
  week: 'Week',
  viewLabel: 'Calendar view',
  legendLabel: 'Who is who',
  addEvent: 'Add event',
  addEventOn: 'Add event on',
  noEvents: 'Nothing planned.',
  allDay: 'All day',
  nextDaySuffix: ' +1',
  moreSuffix: 'more',
} as const;
