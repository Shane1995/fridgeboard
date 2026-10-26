import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../../../../apps/functions/src/handlers/households/index.ts';
import { commitChange } from '../../../../apps/functions/src/utils/commitChange/index.ts';
import { HouseholdRole } from '../../../../apps/functions/src/utils/isHouseholdRole/constants.ts';
import { householdMetaKey } from '../../../../apps/functions/src/utils/keys/householdMetaKey/index.ts';
import { membershipKey } from '../../../../apps/functions/src/utils/keys/membershipKey/index.ts';
import { createTable } from '../../../../apps/functions/src/utils/table/index.ts';
import { buildEvent } from '../dynamodbLocal/buildEvent/index.ts';
import { client } from '../dynamodbLocal/client/index.ts';
import { TABLE_NAME } from '../dynamodbLocal/constants.ts';

const table = createTable(client, TABLE_NAME);

const seedHousehold = async (): Promise<{ sub: string; householdId: string }> => {
  const sub = randomUUID();
  const householdId = randomUUID();
  await client.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { ...householdMetaKey(householdId), name: 'Home' },
    }),
  );
  await client.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { ...membershipKey(householdId, sub), role: HouseholdRole.Owner },
    }),
  );
  return { sub, householdId };
};

const change = ({ householdId, id }: { householdId: string; id: string }) =>
  commitChange({
    table,
    householdId,
    type: 'item',
    id,
    items: [{ put: { PK: `HH#${householdId}`, SK: `ITEM#main#${id}`, name: id } }],
  });

const listChanges = ({
  sub,
  householdId,
  since,
}: {
  sub: string;
  householdId: string;
  since?: string;
}) =>
  handler(
    buildEvent({
      claims: { sub },
      method: 'GET',
      path: `/api/v1/households/${householdId}/changes`,
      pathParameters: { householdId },
      ...(since === undefined ? {} : { query: { since } }),
    }),
  );

const json = (result: { body?: string | undefined }) => JSON.parse(String(result.body));

describe('household changes against DynamoDB Local', () => {
  it('returns the changes after the rev the caller has seen, in order', async () => {
    const member = await seedHousehold();
    await change({ householdId: member.householdId, id: 'a' });
    await change({ householdId: member.householdId, id: 'b' });
    await change({ householdId: member.householdId, id: 'c' });

    const result = await listChanges({ ...member, since: '1' });

    expect(result.statusCode).toBe(200);
    expect(json(result)).toEqual({
      rev: 3,
      changes: [
        { rev: 2, type: 'item', id: 'b' },
        { rev: 3, type: 'item', id: 'c' },
      ],
    });
  });

  it('returns no changes when the caller is up to date', async () => {
    const member = await seedHousehold();
    await change({ householdId: member.householdId, id: 'a' });

    expect(json(await listChanges({ ...member, since: '1' }))).toEqual({ rev: 1, changes: [] });
  });

  it('returns rev 0 and no changes for a household with none', async () => {
    const member = await seedHousehold();

    expect(json(await listChanges({ ...member, since: '0' }))).toEqual({ rev: 0, changes: [] });
  });

  it('returns a snapshot with the current rev when no since is given', async () => {
    const member = await seedHousehold();
    await change({ householdId: member.householdId, id: 'a' });

    expect(json(await listChanges(member))).toEqual({ rev: 1, snapshot: true });
  });

  it('returns a snapshot when the caller is ahead of the household', async () => {
    const member = await seedHousehold();
    await change({ householdId: member.householdId, id: 'a' });

    expect(json(await listChanges({ ...member, since: '9' }))).toEqual({ rev: 1, snapshot: true });
  });

  it('returns a snapshot when more than 100 changes were missed', async () => {
    const member = await seedHousehold();
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...householdMetaKey(member.householdId), name: 'Home', rev: 150 },
      }),
    );

    expect(json(await listChanges({ ...member, since: '10' }))).toEqual({
      rev: 150,
      snapshot: true,
    });
  });

  it('returns a snapshot when a change in the range has expired', async () => {
    const member = await seedHousehold();
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...householdMetaKey(member.householdId), name: 'Home', rev: 5 },
      }),
    );
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `HH#${member.householdId}`,
          SK: 'CHG#0000000005',
          rev: 5,
          type: 'item',
          id: 'e',
        },
      }),
    );

    expect(json(await listChanges({ ...member, since: '2' }))).toEqual({ rev: 5, snapshot: true });
  });

  it('rejects a since that is not a whole number', async () => {
    const member = await seedHousehold();

    expect((await listChanges({ ...member, since: 'abc' })).statusCode).toBe(400);
  });

  it('answers not-found to someone who is not a member', async () => {
    const member = await seedHousehold();

    const result = await listChanges({ sub: randomUUID(), householdId: member.householdId });

    expect(result.statusCode).toBe(404);
  });
});
