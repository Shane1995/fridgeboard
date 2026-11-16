import { randomUUID } from 'node:crypto';
import { ruleKey } from '@fridgeboard/lambda-kit/utils/keys/ruleKey/index.ts';
import {
  allDay,
  call,
  json,
  type Member,
  rev,
  seedMember,
} from '../dynamodbLocal/eventsApi/index.ts';
import { getItem } from '../dynamodbLocal/getItem/index.ts';

const binDay = (member: Member, title: string, startDate: string, color: string) =>
  call(member, 'POST', {
    resource: 'event-rules',
    body: {
      title,
      ownerId: 'household',
      allDay: true,
      startDate,
      frequency: 'weekly',
      interval: 2,
      color,
      reminder: 360,
    },
  });

const list = async (member: Member, from: string, to: string) =>
  json(await call(member, 'GET', { query: { from, to } })).events as {
    id: string;
    title: string;
    startDate: string;
  }[];

const labels = (events: { title: string; startDate: string }[]) =>
  events.map(({ startDate, title }) => `${startDate} ${title}`);

const occurrence = (member: Member, method: string, ruleId: string, date: string, body?: unknown) =>
  call(member, method, {
    resource: 'event-rules',
    suffix: `/${ruleId}/occurrences/${date}`,
    params: { ruleId, date },
    ...(body === undefined ? {} : { body }),
  });

describe('recurring events against DynamoDB Local', () => {
  it('lists two bin-day rules as their fortnightly occurrences', async () => {
    const member = await seedMember();
    await binDay(member, 'General waste', '2026-11-05', 'black');
    await binDay(member, 'Recycling', '2026-11-12', 'sky');

    const events = await list(member, '2026-11-01', '2026-12-31');

    expect(labels(events)).toEqual([
      '2026-11-05 General waste',
      '2026-11-12 Recycling',
      '2026-11-19 General waste',
      '2026-11-26 Recycling',
      '2026-12-03 General waste',
      '2026-12-10 Recycling',
      '2026-12-17 General waste',
      '2026-12-24 Recycling',
      '2026-12-31 General waste',
    ]);
    expect(await rev(member)).toBe(2);
  });

  it('keeps the colour and reminder on the occurrences', async () => {
    const member = await seedMember();
    await binDay(member, 'General waste', '2026-11-05', 'black');

    const [first] = json(
      await call(member, 'GET', { query: { from: '2026-11-01', to: '2026-11-07' } }),
    ).events;

    expect(first).toMatchObject({ color: 'black', reminder: 360, allDay: true });
  });

  it('skips one date without touching the others', async () => {
    const member = await seedMember();
    const rule = json(await binDay(member, 'General waste', '2026-11-05', 'black'));

    const result = await occurrence(member, 'DELETE', rule.id, '2026-11-19');

    expect(result.statusCode).toBe(204);
    expect(labels(await list(member, '2026-11-01', '2026-12-10'))).toEqual([
      '2026-11-05 General waste',
      '2026-12-03 General waste',
    ]);
    expect(
      await getItem(ruleKey({ householdId: member.householdId, ruleId: rule.id })),
    ).toMatchObject({
      skip: ['2026-11-19'],
    });
    expect(await rev(member)).toBe(2);
  });

  it('turns one date into its own event on another day', async () => {
    const member = await seedMember();
    const rule = json(await binDay(member, 'Recycling', '2026-11-12', 'sky'));

    const result = await occurrence(member, 'POST', rule.id, '2026-11-26', {
      title: 'Recycling (Friday)',
      startDate: '2026-11-27',
      endDate: '2026-11-27',
    });

    expect(result.statusCode).toBe(201);
    expect(labels(await list(member, '2026-11-20', '2026-12-01'))).toEqual([
      '2026-11-27 Recycling (Friday)',
    ]);
    expect(await rev(member)).toBe(2);
  });

  it('answers 404 for a date the rule does not fall on', async () => {
    const member = await seedMember();
    const rule = json(await binDay(member, 'General waste', '2026-11-05', 'black'));

    const result = await occurrence(member, 'DELETE', rule.id, '2026-11-12');

    expect(result.statusCode).toBe(404);
    expect(await rev(member)).toBe(1);
  });

  it('changes every occurrence when the rule is edited, and ends them when it is deleted', async () => {
    const member = await seedMember();
    const rule = json(await binDay(member, 'General waste', '2026-11-05', 'black'));
    const options = { resource: 'event-rules', suffix: `/${rule.id}`, params: { ruleId: rule.id } };

    const patched = await call(member, 'PATCH', { ...options, body: { interval: 1 } });

    expect(patched.statusCode).toBe(200);
    expect(labels(await list(member, '2026-11-01', '2026-11-14'))).toEqual([
      '2026-11-05 General waste',
      '2026-11-12 General waste',
    ]);
    const removed = await call(member, 'DELETE', options);
    expect(removed.statusCode).toBe(204);
    expect(await list(member, '2026-11-01', '2026-11-30')).toEqual([]);
  });

  it('lists a one-off event and a rule together, in date order', async () => {
    const member = await seedMember();
    await binDay(member, 'General waste', '2026-11-05', 'black');
    await allDay(member, '2026-11-06', '2026-11-06', 'Dentist');
    await allDay(member, '2026-11-04', '2026-11-04', 'Trip');

    expect(labels(await list(member, '2026-11-01', '2026-11-07'))).toEqual([
      '2026-11-04 Trip',
      '2026-11-05 General waste',
      '2026-11-06 Dentist',
    ]);
  });

  it('stops at 50 rules', async () => {
    const member = await seedMember();
    for (let index = 0; index < 50; index += 1) {
      await binDay(member, `Rule ${index}`, '2026-11-05', 'sky');
    }

    const result = await binDay(member, 'One too many', '2026-11-05', 'sky');

    expect(result.statusCode).toBe(409);
    expect(json(result)).toEqual({ reason: 'too-many-rules' });
  }, 60_000);

  it('refuses a stranger', async () => {
    const member = await seedMember();
    const stranger = { sub: randomUUID(), householdId: member.householdId };

    const result = await call(stranger, 'GET', { resource: 'event-rules' });

    expect(result.statusCode).toBe(404);
  });
});
