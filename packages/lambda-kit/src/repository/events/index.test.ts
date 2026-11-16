import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import type { IEvent } from '@fridgeboard/contract/events';
import { eventKey } from '../../utils/keys/eventKey/index.ts';
import { createTable } from '../../utils/table/index.ts';
import { deleteEventOp, getEvent, putEventOp, queryEvents } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const table = createTable(DynamoDBDocumentClient.from(new DynamoDBClient({})), 'fridgeboard');
const scope = { householdId: 'hh-1' };

const timedRow = (id: string, startDate: string, endDate: string, startsAt: string) => ({
  ...eventKey({ ...scope, startDate, eventId: id }),
  id,
  title: `Event ${id}`,
  note: '',
  ownerId: 'household',
  eventType: 'event',
  allDay: false,
  startDate,
  endDate,
  startsAt,
  endsAt: startsAt,
});

const allDayRow = (id: string, startDate: string, endDate: string) => ({
  ...eventKey({ ...scope, startDate, eventId: id }),
  id,
  title: `Event ${id}`,
  note: 'n',
  ownerId: 'sub-1',
  eventType: 'event',
  allDay: true,
  startDate,
  endDate,
});

describe('event mapping', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('keeps the times of a timed event', async () => {
    ddbMock
      .on(GetCommand)
      .resolves({ Item: timedRow('a', '2026-11-03', '2026-11-03', '2026-11-03T09:00:00Z') });

    expect(await getEvent({ table, scope, startDate: '2026-11-03', eventId: 'a' })).toEqual({
      id: 'a',
      title: 'Event a',
      note: '',
      ownerId: 'household',
      eventType: 'event',
      allDay: false,
      startDate: '2026-11-03',
      endDate: '2026-11-03',
      startsAt: '2026-11-03T09:00:00Z',
      endsAt: '2026-11-03T09:00:00Z',
    });
  });

  it('keeps the colour and reminder of an event', async () => {
    ddbMock.on(GetCommand).resolves({
      Item: { ...allDayRow('c', '2026-11-05', '2026-11-05'), color: 'mint', reminder: 360 },
    });

    expect(await getEvent({ table, scope, startDate: '2026-11-05', eventId: 'c' })).toMatchObject({
      color: 'mint',
      reminder: 360,
    });
  });

  it('maps an all-day row without times', async () => {
    ddbMock.on(GetCommand).resolves({
      Item: { ...allDayRow('b', '2026-11-03', '2026-11-05'), startsAt: 'x' },
    });

    expect(await getEvent({ table, scope, startDate: '2026-11-03', eventId: 'b' })).toEqual({
      id: 'b',
      title: 'Event b',
      note: 'n',
      ownerId: 'sub-1',
      eventType: 'event',
      allDay: true,
      startDate: '2026-11-03',
      endDate: '2026-11-05',
    });
  });
});

describe('queryEvents', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('queries from 31 days before the window to the end of the last day', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });

    await queryEvents({ table, scope, from: '2026-11-01', to: '2026-11-30' });

    expect(ddbMock.commandCalls(QueryCommand)[0]?.args[0].input).toMatchObject({
      KeyConditionExpression: 'PK = :pk AND SK BETWEEN :lo AND :hi',
      ExpressionAttributeValues: {
        ':pk': 'HH#hh-1',
        ':lo': 'EVENT#2026-10-01',
        ':hi': 'EVENT#2026-11-30#~',
      },
    });
  });

  it('drops events that ended before the window', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [
        allDayRow('old', '2026-10-20', '2026-10-31'),
        allDayRow('overlap', '2026-10-20', '2026-11-01'),
      ],
    });

    const events = await queryEvents({ table, scope, from: '2026-11-01', to: '2026-11-30' });

    expect(events.map(({ id }) => id)).toEqual(['overlap']);
  });

  it('keeps an event starting on the last day of the window', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [allDayRow('edge', '2026-11-30', '2026-11-30')] });

    const events = await queryEvents({ table, scope, from: '2026-11-01', to: '2026-11-30' });

    expect(events.map(({ id }) => id)).toEqual(['edge']);
  });

  it('sorts by start date, then time, then id', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [
        timedRow('c', '2026-11-03', '2026-11-03', '2026-11-03T15:00:00Z'),
        allDayRow('z', '2026-11-03', '2026-11-03'),
        timedRow('b', '2026-11-03', '2026-11-03', '2026-11-03T09:00:00Z'),
        timedRow('a', '2026-11-03', '2026-11-03', '2026-11-03T09:00:00Z'),
        allDayRow('first', '2026-11-02', '2026-11-02'),
      ],
    });

    const events = await queryEvents({ table, scope, from: '2026-11-01', to: '2026-11-30' });

    expect(events.map(({ id }) => id)).toEqual(['first', 'z', 'a', 'b', 'c']);
  });

  it('is empty when there are no events', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });

    expect(await queryEvents({ table, scope, from: '2026-11-01', to: '2026-11-30' })).toEqual([]);
  });
});

describe('getEvent', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('reads the event by its date and id', async () => {
    ddbMock.on(GetCommand).resolves({ Item: allDayRow('a', '2026-11-03', '2026-11-03') });

    const event = await getEvent({ table, scope, startDate: '2026-11-03', eventId: 'a' });

    expect(event).toMatchObject({ id: 'a' });
    expect(ddbMock.commandCalls(GetCommand)[0]?.args[0].input.Key).toEqual({
      PK: 'HH#hh-1',
      SK: 'EVENT#2026-11-03#a',
    });
  });

  it('is undefined when there is no such event', async () => {
    ddbMock.on(GetCommand).resolves({});

    expect(
      await getEvent({ table, scope, startDate: '2026-11-03', eventId: 'missing' }),
    ).toBeUndefined();
  });
});

describe('event writes', () => {
  const event: IEvent = {
    id: 'a',
    title: 'Trip',
    note: '',
    ownerId: 'household',
    eventType: 'event',
    allDay: true,
    startDate: '2026-11-03',
    endDate: '2026-11-05',
  };

  it('puts the event under its date key', () => {
    expect(putEventOp({ scope, event })).toEqual({
      put: { PK: 'HH#hh-1', SK: 'EVENT#2026-11-03#a', ...event },
    });
  });

  it('deletes an event by its date key', () => {
    expect(deleteEventOp({ scope, startDate: '2026-11-03', eventId: 'a' })).toEqual({
      delete: { PK: 'HH#hh-1', SK: 'EVENT#2026-11-03#a' },
    });
  });
});
