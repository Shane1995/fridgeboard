import type { ShopColor } from '../../services/shoppingList/constants';

type EventBase = { id: string; title: string; ownerId: string; note: string };

export type TimedEvent = EventBase & { allDay: false; startsAt: string; endsAt: string };

export type AllDayEvent = EventBase & { allDay: true; startDate: string; endDate: string };

export type CalendarEvent = TimedEvent | AllDayEvent;

export type CalendarMember = { id: string; name: string; color: ShopColor };

export type EventDraft = {
  title: string;
  allDay: boolean;
  date: string;
  startTime: string;
  endTime: string;
  ownerId: string;
  note: string;
};

export type MonthCell = { date: string; inMonth: boolean };

export type LondonParts = { date: string; time: string };

export type PlannerLine = { id: string; text: string };

export type PlannerSection = { id: string; title: string; lines: PlannerLine[] };

export type PlannerPlan = { days: PlannerSection[]; notes: PlannerSection[] };
