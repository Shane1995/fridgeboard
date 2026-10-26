import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { commitChange } from '../../../../apps/functions/src/utils/commitChange/index.ts';
import { changeKey } from '../../../../apps/functions/src/utils/keys/changeKey/index.ts';
import { householdMetaKey } from '../../../../apps/functions/src/utils/keys/householdMetaKey/index.ts';
import { createTable } from '../../../../apps/functions/src/utils/table/index.ts';
import { client } from '../dynamodbLocal/client/index.ts';
import { TABLE_NAME } from '../dynamodbLocal/constants.ts';
import { getItem } from '../dynamodbLocal/getItem/index.ts';

const table = createTable(client, TABLE_NAME);

const seedHousehold = async (): Promise<string> => {
  const householdId = randomUUID();
  await client.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { ...householdMetaKey(householdId), name: 'Home' },
    }),
  );
  return householdId;
};

const write = ({ householdId, id }: { householdId: string; id: string }) =>
  commitChange({
    table,
    householdId,
    changes: [{ type: 'item', id }],
    items: [{ put: { PK: `HH#${householdId}`, SK: `ITEM#main#${id}`, name: id } }],
  });

describe('commitChange against DynamoDB Local', () => {
  it('numbers changes one after another and keeps the rev on the household', async () => {
    const householdId = await seedHousehold();

    const first = await write({ householdId, id: 'a' });
    const second = await write({ householdId, id: 'b' });

    expect([first[0]?.rev, second[0]?.rev]).toEqual([1, 2]);
    expect((await getItem(householdMetaKey(householdId)))?.rev).toBe(2);
    expect(await getItem(changeKey({ householdId, rev: 2 }))).toMatchObject({
      rev: 2,
      type: 'item',
      id: 'b',
    });
    expect(await getItem({ PK: `HH#${householdId}`, SK: 'ITEM#main#b' })).toMatchObject({
      name: 'b',
    });
  });

  it('never hands the same rev to two writers racing at the same moment', async () => {
    const householdId = await seedHousehold();
    const ids = Array.from({ length: 20 }, (_, index) => `item-${index}`);

    const results = await Promise.allSettled(ids.map((id) => write({ householdId, id })));

    const revs = results.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value[0]?.rev] : [],
    );
    expect(new Set(revs).size).toBe(revs.length);
    expect(results.every((result) => result.status === 'fulfilled')).toBe(true);
    expect((await getItem(householdMetaKey(householdId)))?.rev).toBe(20);
  });

  it('writes nothing when the household does not exist', async () => {
    const householdId = randomUUID();

    await expect(write({ householdId, id: 'a' })).rejects.toThrow();

    expect(await getItem(householdMetaKey(householdId))).toBeUndefined();
    expect(await getItem({ PK: `HH#${householdId}`, SK: 'ITEM#main#a' })).toBeUndefined();
  });
});
