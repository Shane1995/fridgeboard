import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../../../../apps/functions/src/handlers/listItems/index.ts';
import { HouseholdRole } from '../../../../apps/functions/src/utils/isHouseholdRole/constants.ts';
import { shopKey } from '../../../../apps/functions/src/utils/keys/shopKey/index.ts';
import { historyKey } from '../../../../apps/functions/src/utils/keys/historyKey/index.ts';
import { itemKey } from '../../../../apps/functions/src/utils/keys/itemKey/index.ts';
import { membershipKey } from '../../../../apps/functions/src/utils/keys/membershipKey/index.ts';
import { buildEvent } from '../dynamodbLocal/buildEvent/index.ts';
import { client } from '../dynamodbLocal/client/index.ts';
import { TABLE_NAME } from '../dynamodbLocal/constants.ts';
import { getItem } from '../dynamodbLocal/getItem/index.ts';

const BASE = (householdId: string) => `/api/v1/households/${householdId}/lists/main`;

const seedMember = async (): Promise<{ sub: string; householdId: string }> => {
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
  { sub, householdId }: { sub: string; householdId: string },
  method: string,
  suffix = '',
  body?: unknown,
  itemId?: string,
) =>
  handler(
    buildEvent({
      claims: { sub },
      method,
      path: `${BASE(householdId)}${suffix}`,
      pathParameters: { householdId, listId: 'main', ...(itemId ? { itemId } : {}) },
      body,
    }),
  );

const json = (result: { body?: string | undefined }) => JSON.parse(String(result.body));

describe('list items handler against DynamoDB Local', () => {
  it('adds an item, lists it, and counts it in the history', async () => {
    const member = await seedMember();

    const created = await call(member, 'POST', '/items', { name: '  Oat milk ' });
    await call(member, 'POST', '/items', { name: 'oat milk' });
    const listed = json(await call(member, 'GET', '/items'));
    const history = json(await call(member, 'GET', '/history'));

    expect(created.statusCode).toBe(201);
    expect(listed.items.map((item: { name: string }) => item.name)).toEqual([
      'Oat milk',
      'oat milk',
    ]);
    expect(listed.items[0]).toMatchObject({
      shopId: 'unsorted',
      checked: false,
      addedBy: member.sub,
    });
    expect(history.entries).toEqual([{ name: 'oat milk', shopId: 'unsorted', count: 2 }]);
    expect(
      await getItem(
        historyKey({ householdId: member.householdId, listId: 'main', name: 'Oat Milk' }),
      ),
    ).toMatchObject({
      count: 2,
    });
  });

  it('ticks, renames and moves an item, and remembers the new shop in the history', async () => {
    const member = await seedMember();
    const shopId = 'b1';
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...shopKey({ householdId: member.householdId, listId: 'main', shopId: shopId }),
          id: shopId,
          name: 'Aldi',
          color: 'sky',
          order: 0,
        },
      }),
    );
    const { id } = json(await call(member, 'POST', '/items', { name: 'Eggs' }));

    const updated = await call(
      member,
      'PATCH',
      `/items/${id}`,
      { checked: true, name: 'Free eggs', shopId },
      id,
    );

    expect(updated.statusCode).toBe(200);
    expect(json(updated)).toMatchObject({ checked: true, name: 'Free eggs', shopId });
    expect(
      await getItem(itemKey({ householdId: member.householdId, listId: 'main', itemId: id })),
    ).toMatchObject({
      name: 'Free eggs',
    });
    expect(
      await getItem(
        historyKey({ householdId: member.householdId, listId: 'main', name: 'Free eggs' }),
      ),
    ).toBeUndefined();
  });

  it('moves the history entry of an item to the new shop', async () => {
    const member = await seedMember();
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...shopKey({ householdId: member.householdId, listId: 'main', shopId: 'b1' }),
          id: 'b1',
          name: 'Aldi',
          color: 'sky',
          order: 0,
        },
      }),
    );
    const { id } = json(await call(member, 'POST', '/items', { name: 'Eggs' }));

    await call(member, 'PATCH', `/items/${id}`, { shopId: 'b1' }, id);

    expect(
      await getItem(historyKey({ householdId: member.householdId, listId: 'main', name: 'Eggs' })),
    ).toMatchObject({
      shopId: 'b1',
    });
  });

  it('refuses an unknown shop, an empty name and an empty patch', async () => {
    const member = await seedMember();
    const { id } = json(await call(member, 'POST', '/items', { name: 'Eggs' }));

    const unknownShop = await call(member, 'POST', '/items', { name: 'Tea', shopId: 'nope' });
    const emptyName = await call(member, 'POST', '/items', { name: '   ' });
    const emptyPatch = await call(member, 'PATCH', `/items/${id}`, {}, id);

    expect(unknownShop.statusCode).toBe(400);
    expect(json(unknownShop)).toEqual({ reason: 'invalid-shop' });
    expect(json(emptyName)).toEqual({ reason: 'invalid-name' });
    expect(emptyPatch.statusCode).toBe(400);
  });

  it('gets, deletes and then 404s on a missing item', async () => {
    const member = await seedMember();
    const { id } = json(await call(member, 'POST', '/items', { name: 'Eggs' }));

    expect((await call(member, 'GET', `/items/${id}`, undefined, id)).statusCode).toBe(200);
    expect((await call(member, 'DELETE', `/items/${id}`, undefined, id)).statusCode).toBe(204);
    expect((await call(member, 'GET', `/items/${id}`, undefined, id)).statusCode).toBe(404);
    expect((await call(member, 'DELETE', `/items/${id}`, undefined, id)).statusCode).toBe(404);
    expect((await call(member, 'PATCH', `/items/${id}`, { checked: true }, id)).statusCode).toBe(
      404,
    );
  });

  it('hides a household from someone who is not a member', async () => {
    const member = await seedMember();
    const outsider = { sub: randomUUID(), householdId: member.householdId };
    await call(member, 'POST', '/items', { name: 'Eggs' });

    expect((await call(outsider, 'GET', '/items')).statusCode).toBe(404);
    expect((await call(outsider, 'POST', '/items', { name: 'Spam' })).statusCode).toBe(404);
    expect((await call(outsider, 'GET', '/history')).statusCode).toBe(404);
  });

  it('keeps one household’s items out of another’s', async () => {
    const first = await seedMember();
    const second = await seedMember();
    await call(first, 'POST', '/items', { name: 'Eggs' });

    expect(json(await call(second, 'GET', '/items')).items).toEqual([]);
  });
});
