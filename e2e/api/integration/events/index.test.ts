import { randomUUID } from 'node:crypto';
import { changeKey } from '@fridgeboard/lambda-kit/utils/keys/changeKey/index.ts';
import { eventKey } from '@fridgeboard/lambda-kit/utils/keys/eventKey/index.ts';
import { allDay, call, json, rev, seedMember } from '../dynamodbLocal/eventsApi/index.ts';
import { getItem } from '../dynamodbLocal/getItem/index.ts';

describe('events handler against DynamoDB Local', () => {
  it('creates an event, bumps the rev and writes a change row', async () => {
    const member = await seedMember();

    const result = await call(member, 'POST', {
      body: {
        title: 'Late shift',
        ownerId: member.sub,
        allDay: false,
        startsAt: '2026-07-01T23:30:00Z',
        endsAt: '2026-07-02T05:00:00Z',
      },
    });

    expect(result.statusCode).toBe(201);
    const event = json(result);
    expect(event).toMatchObject({ startDate: '2026-07-02', endDate: '2026-07-02' });
    expect(
      await getItem(
        eventKey({ householdId: member.householdId, startDate: '2026-07-02', eventId: event.id }),
      ),
    ).toMatchObject({ id: event.id, title: 'Late shift', startsAt: '2026-07-01T23:30:00Z' });
    expect(await rev(member)).toBe(1);
    expect(await getItem(changeKey({ householdId: member.householdId, rev: 1 }))).toMatchObject({
      type: 'event',
      id: event.id,
    });
  });

  it('stores a shift across the October clock change on its London dates', async () => {
    const member = await seedMember();

    const result = await call(member, 'POST', {
      body: {
        title: 'Night shift',
        ownerId: member.sub,
        allDay: false,
        startsAt: '2026-10-24T22:00:00Z',
        endsAt: '2026-10-25T03:00:00Z',
      },
    });

    expect(json(result)).toMatchObject({ startDate: '2026-10-24', endDate: '2026-10-25' });
  });

  it('lists only the events that overlap the window', async () => {
    const member = await seedMember();
    const early = json(await allDay(member, '2026-10-01', '2026-11-01', 'early'));
    await allDay(member, '2026-10-20', '2026-10-31', 'before');
    const edge = json(await allDay(member, '2026-11-30', '2026-11-30', 'edge'));
    await allDay(member, '2026-12-01', '2026-12-01', 'after');

    const result = await call(member, 'GET', {
      query: { from: '2026-11-01', to: '2026-11-30' },
    });

    expect(result.statusCode).toBe(200);
    expect(json(result).events.map(({ id }: { id: string }) => id)).toEqual([early.id, edge.id]);
  });

  it('moves the item when the start date changes', async () => {
    const member = await seedMember();
    const { id } = json(await allDay(member, '2026-11-03', '2026-11-03'));

    const result = await call(member, 'PATCH', {
      suffix: `/${id}`,
      eventId: id,
      query: { date: '2026-11-03' },
      body: { startDate: '2026-11-10', endDate: '2026-11-10' },
    });

    expect(result.statusCode).toBe(200);
    const { householdId } = member;
    expect(await getItem(eventKey({ householdId, startDate: '2026-11-03', eventId: id }))).toBe(
      undefined,
    );
    expect(
      await getItem(eventKey({ householdId, startDate: '2026-11-10', eventId: id })),
    ).toMatchObject({ id, startDate: '2026-11-10' });
    expect(await rev(member)).toBe(2);
  });

  it('answers 404 for a wrong date on patch and delete and leaves the table unchanged', async () => {
    const member = await seedMember();
    const { id } = json(await allDay(member, '2026-11-03', '2026-11-03'));
    const options = { suffix: `/${id}`, eventId: id, query: { date: '2026-11-04' } };

    const patched = await call(member, 'PATCH', { ...options, body: { title: 'Changed' } });
    const deleted = await call(member, 'DELETE', options);

    expect([patched.statusCode, deleted.statusCode]).toEqual([404, 404]);
    expect(
      await getItem(
        eventKey({ householdId: member.householdId, startDate: '2026-11-03', eventId: id }),
      ),
    ).toMatchObject({ title: 'Trip' });
    expect(
      await getItem(
        eventKey({ householdId: member.householdId, startDate: '2026-11-04', eventId: id }),
      ),
    ).toBe(undefined);
    expect(await rev(member)).toBe(1);
  });

  it('deletes an event', async () => {
    const member = await seedMember();
    const { id } = json(await allDay(member, '2026-11-03', '2026-11-03'));

    const result = await call(member, 'DELETE', {
      suffix: `/${id}`,
      eventId: id,
      query: { date: '2026-11-03' },
    });

    expect(result.statusCode).toBe(204);
    expect(
      await getItem(
        eventKey({ householdId: member.householdId, startDate: '2026-11-03', eventId: id }),
      ),
    ).toBe(undefined);
    expect(await rev(member)).toBe(2);
  });

  it('refuses a non-member and an owner who is not a member', async () => {
    const member = await seedMember();
    const stranger = { sub: randomUUID(), householdId: member.householdId };

    const refused = await call(stranger, 'GET', {
      query: { from: '2026-11-01', to: '2026-11-30' },
    });
    const badOwner = await call(member, 'POST', {
      body: {
        title: 'Trip',
        ownerId: randomUUID(),
        allDay: true,
        startDate: '2026-11-03',
        endDate: '2026-11-03',
      },
    });

    expect(refused.statusCode).toBe(404);
    expect(badOwner.statusCode).toBe(400);
    expect(json(badOwner)).toEqual({ reason: 'invalid-owner' });
  });
});
