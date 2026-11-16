export type IEventBase = {
  id: string;
  title: string;
  note: string;
  ownerId: string;
  eventType: 'event';
  startDate: string;
  endDate: string;
  color?: string;
  reminder?: number;
  ruleId?: string;
};

export type ITimedEvent = IEventBase & { allDay: false; startsAt: string; endsAt: string };

export type IAllDayEvent = IEventBase & { allDay: true };

export type IEvent = ITimedEvent | IAllDayEvent;

export type IEventsResponse = { events: IEvent[] };

export type IEventInput = {
  title: string;
  note?: string;
  ownerId: string;
  color?: string | null;
  reminder?: number | null;
} & (
  | { allDay: false; startsAt: string; endsAt: string }
  | { allDay: true; startDate: string; endDate: string }
);

export type IEventRuleFrequency = 'daily' | 'weekly' | 'monthly';

export type IEventRuleBase = {
  id: string;
  title: string;
  note: string;
  ownerId: string;
  color?: string;
  reminder?: number;
  startDate: string;
  frequency: IEventRuleFrequency;
  interval: number;
  weekdays?: number[];
  until?: string;
  skip: string[];
};

export type ITimedEventRule = IEventRuleBase & {
  allDay: false;
  startTime: string;
  endTime: string;
};

export type IAllDayEventRule = IEventRuleBase & { allDay: true };

export type IEventRule = ITimedEventRule | IAllDayEventRule;

export type IEventRulesResponse = { rules: IEventRule[] };

export type IEventRuleInput = {
  title: string;
  note?: string;
  ownerId: string;
  color?: string | null;
  reminder?: number | null;
  startDate: string;
  frequency: IEventRuleFrequency;
  interval?: number;
  weekdays?: number[];
  until?: string | null;
} & ({ allDay: true } | { allDay: false; startTime: string; endTime: string });

export type IEventErrorReason =
  | 'invalid-title'
  | 'invalid-note'
  | 'invalid-owner'
  | 'invalid-time'
  | 'invalid-date'
  | 'invalid-range'
  | 'invalid-color'
  | 'invalid-reminder'
  | 'invalid-window'
  | 'invalid-rule'
  | 'too-many-rules'
  | 'too-many-skips'
  | 'invalid-request'
  | 'not-found';

export type IEventErrorResponse = { reason: IEventErrorReason };
