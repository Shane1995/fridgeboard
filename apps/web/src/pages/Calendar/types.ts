import type { ShopColor } from '../../services/shoppingList/constants';

type EventBase = {
  id: string;
  title: string;
  ownerId: string;
  note: string;
  color?: ShopColor;
  reminder?: number;
  ruleId?: string;
};

export type TimedEvent = EventBase & { allDay: false; startsAt: string; endsAt: string };

export type AllDayEvent = EventBase & { allDay: true; startDate: string; endDate: string };

export type CalendarEvent = TimedEvent | AllDayEvent;

export type CalendarMember = { id: string; name: string; color: ShopColor };

export type RepeatFrequency = 'daily' | 'weekly' | 'monthly';

export type RepeatDraft = {
  frequency: RepeatFrequency;
  interval: number;
  weekdays: number[];
  until?: string;
};

export type EventDraft = {
  title: string;
  allDay: boolean;
  date: string;
  endDate?: string;
  color?: ShopColor;
  reminder?: number;
  repeat?: RepeatDraft;
  startTime: string;
  endTime: string;
  ownerId: string;
  note: string;
};

export type MonthCell = { date: string; inMonth: boolean };

export type LondonParts = { date: string; time: string };
