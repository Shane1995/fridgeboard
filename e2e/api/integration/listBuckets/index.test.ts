import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { handler as itemsHandler } from '../../../../apps/functions/src/handlers/listItems/index.ts';
import { handler } from '../../../../apps/functions/src/handlers/listBuckets/index.ts';
import { HouseholdRole } from '../../../../apps/functions/src/utils/isHouseholdRole/constants.ts';
import { itemKey } from '../../../../apps/functions/src/utils/keys/itemKey/index.ts';
import { membershipKey } from '../../../../apps/functions/src/utils/keys/membershipKey/index.ts';
import { buildEvent } from '../dynamodbLocal/buildEvent/index.ts';
import { client } from '../dynamodbLocal/client/index.ts';
import { TABLE_NAME } from '../dynamodbLocal/constants.ts';
import { getItem } from '../dynamodbLocal/getItem/index.ts';

type Member = { sub: string; householdId: string };

const seedMember = async (): Promise<Member> => {
  const sub = randomUUID();
  const householdId = randomUUID();
  await client.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { ...membershipKey(householdId, sub), role: HouseholdRole.Member },
    }),
  );
  return { sub, householdId };
};

const call = (
  { sub, householdId }: Member,
  method: string,
  suffix = '',
  body?: unknown,
  bucketId?: string,
) =>
  handler(
    buildEvent({
      claims: { sub },
      method,
      path: `/api/v1/households/${householdId}/lists/main/buckets${suffix}`,
      pathParameters: { householdId, listId: 'main', ...(bucketId ? { bucketId } : {}) },
      body,
    }),
  );

const json = (result: { body?: string | undefined }) => JSON.parse(String(result.body));

const createBucket = async (member: Member, name: string, color = 'sky') =>
  json(await call(member, 'POST', '', { name, color }));

describe('list buckets handler against DynamoDB Local', () => {
  it('creates buckets in order and lists them', async () => {
    const member = await seedMember();

    const first = await createBucket(member, 'Aldi');
    const second = await createBucket(member, 'Butcher', 'tomato');
    const listed = json(await call(member, 'GET'));

    expect([first.order, second.order]).toEqual([0, 1]);
    expect(listed.buckets).toEqual([first, second]);
  });

  it('refuses a bad name or colour', async () => {
    const member = await seedMember();

    const noName = await call(member, 'POST', '', { name: ' ', color: 'sky' });
    const badColor = await call(member, 'POST', '', { name: 'Aldi', color: 'beige' });

    expect(json(noName)).toEqual({ reason: 'invalid-name' });
    expect(json(badColor)).toEqual({ reason: 'invalid-color' });
  });

  it('renames and recolours a bucket, and 404s on a missing one', async () => {
    const member = await seedMember();
    const { id } = await createBucket(member, 'Aldi');

    const updated = await call(member, 'PATCH', `/${id}`, { name: 'Lidl', color: 'mint' }, id);

    expect(json(updated)).toMatchObject({ id, name: 'Lidl', color: 'mint' });
    expect((await call(member, 'PATCH', '/nope', { name: 'x' }, 'nope')).statusCode).toBe(404);
    expect((await call(member, 'PATCH', `/${id}`, {}, id)).statusCode).toBe(400);
  });

  it('reorders buckets and puts unlisted ones last', async () => {
    const member = await seedMember();
    const a = await createBucket(member, 'A');
    const b = await createBucket(member, 'B');
    const c = await createBucket(member, 'C');

    const result = await call(member, 'PUT', '/order', { ids: [c.id, a.id] });

    expect(json(result).buckets.map(({ id }: { id: string }) => id)).toEqual([c.id, a.id, b.id]);
    expect(json(await call(member, 'GET')).buckets.map(({ id }: { id: string }) => id)).toEqual([
      c.id,
      a.id,
      b.id,
    ]);
    expect((await call(member, 'PUT', '/order', { ids: ['nope'] })).statusCode).toBe(400);
  });

  it('moves a deleted bucket’s items back to General', async () => {
    const member = await seedMember();
    const { id: bucketId } = await createBucket(member, 'Aldi');
    const { id: itemId } = json(
      await itemsHandler(
        buildEvent({
          claims: { sub: member.sub },
          method: 'POST',
          path: `/api/v1/households/${member.householdId}/lists/main/items`,
          pathParameters: { householdId: member.householdId, listId: 'main' },
          body: { name: 'Eggs', bucketId },
        }),
      ),
    );

    const removed = await call(member, 'DELETE', `/${bucketId}`, undefined, bucketId);

    expect(removed.statusCode).toBe(204);
    expect(await getItem(itemKey(member.householdId, 'main', itemId))).toMatchObject({
      bucketId: 'unsorted',
    });
    expect(json(await call(member, 'GET')).buckets).toEqual([]);
    expect((await call(member, 'DELETE', `/${bucketId}`, undefined, bucketId)).statusCode).toBe(
      404,
    );
  });

  it('hides buckets from someone who is not a member', async () => {
    const member = await seedMember();
    await createBucket(member, 'Aldi');
    const outsider = { sub: randomUUID(), householdId: member.householdId };

    expect((await call(outsider, 'GET')).statusCode).toBe(404);
    expect((await call(outsider, 'POST', '', { name: 'x', color: 'sky' })).statusCode).toBe(404);
  });
});
