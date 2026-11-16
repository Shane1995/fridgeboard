import type { IEvent } from '@fridgeboard/contract/events';
import type { Endpoint } from '../../services/configuration/types';
import { TEST_HOUSEHOLD_ID } from '../fakeShoppingList/constants';

const BASE = `/api/v1/households/${TEST_HOUSEHOLD_ID}`;
const DATE_LENGTH = 10;

const state: { events: IEvent[]; counter: number } = { events: [], counter: 0 };

export const resetFakeEvents = () => {
  state.events = [];
  state.counter = 0;
};

export const seedFakeEvents = (events: IEvent[]) => {
  state.events = [...events];
};

export const isEventsPath = (path: string) =>
  path.startsWith(`${BASE}/events`) || path.startsWith(`${BASE}/event-rules`);

const json = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status });

const readBody = (init: RequestInit): Record<string, unknown> =>
  typeof init.body === 'string' ? JSON.parse(init.body) : {};

// Test double: the real server derives these dates in London time. Fixtures here use UTC
// instants inside the same London day, so the date prefix is enough.
const withDates = (fields: Record<string, unknown>): Record<string, unknown> =>
  fields.allDay === false
    ? {
        ...fields,
        startDate: String(fields.startsAt).slice(0, DATE_LENGTH),
        endDate: String(fields.endsAt).slice(0, DATE_LENGTH),
      }
    : fields;

const listEvents = (search: URLSearchParams) => {
  const from = search.get('from') ?? '';
  const to = search.get('to') ?? '';
  return json(200, {
    events: state.events.filter((event) => event.startDate <= to && event.endDate >= from),
  });
};

const createEvent = (init: RequestInit) => {
  state.counter += 1;
  const event = {
    note: '',
    eventType: 'event',
    ...withDates(readBody(init)),
    id: `event-${state.counter}`,
  } as IEvent;
  state.events = [...state.events, event];
  return json(201, event);
};

const findAt = (id: string, date: string | null) =>
  state.events.find((event) => event.id === id && event.startDate === date);

const updateEvent = (id: string, search: URLSearchParams, init: RequestInit) => {
  const current = findAt(id, search.get('date'));
  if (current === undefined) {
    return json(404, { reason: 'not-found' });
  }
  const next = { ...current, ...withDates(readBody(init)) } as IEvent;
  state.events = state.events.map((event) => (event === current ? next : event));
  return json(200, next);
};

const removeEvent = (id: string, search: URLSearchParams) => {
  const current = findAt(id, search.get('date'));
  if (current === undefined) {
    return json(404, { reason: 'not-found' });
  }
  state.events = state.events.filter((event) => event !== current);
  return json(204);
};

export const fakeEventsApi = async ({ path }: Endpoint, init: RequestInit = {}) => {
  const [route = '', search = ''] = path.split('?');
  const query = new URLSearchParams(search);
  const method = init.method ?? 'GET';
  if (route === `${BASE}/event-rules`) {
    return json(200, { rules: [] });
  }
  if (route === `${BASE}/events`) {
    return method === 'GET' ? listEvents(query) : createEvent(init);
  }
  const id = route.slice(`${BASE}/events/`.length);
  return method === 'PATCH' ? updateEvent(id, query, init) : removeEvent(id, query);
};
