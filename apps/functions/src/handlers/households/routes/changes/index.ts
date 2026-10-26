import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IChangesResponse } from '@fridgeboard/contract/changes';
import { isMember } from '../../../../utils/isMember/index.ts';
import { ChangeItemSchema } from '../../../../utils/items/changeItem/index.ts';
import { HouseholdMetaItemSchema } from '../../../../utils/items/householdMetaItem/index.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { changeKey } from '../../../../utils/keys/changeKey/index.ts';
import { householdMetaKey } from '../../../../utils/keys/householdMetaKey/index.ts';
import { readSince } from '../../../../utils/readSince/index.ts';
import { ID_PATTERN } from '../../../../utils/resolveList/constants.ts';
import { createTable } from '../../../../utils/table/index.ts';
import type { AuthenticatedUser } from '../../../../utils/withAuthenticatedUser/types.ts';
import { CHANGES_LIMIT, RANGE_CONDITION } from './constants.ts';

export const listChanges = async (
  { event, sub }: AuthenticatedUser,
  client: DynamoDBDocumentClient,
) => {
  const table = createTable(client, String(process.env.TABLE_NAME));
  const householdId = event.pathParameters?.householdId;
  if (
    householdId === undefined ||
    !ID_PATTERN.test(householdId) ||
    !(await isMember({ table, householdId, sub }))
  ) {
    return jsonResponse(404, { reason: 'not-found' });
  }
  const since = readSince({ value: event.queryStringParameters?.['since'] });
  if (since.status === 'invalid') {
    return jsonResponse(400, { reason: 'invalid-request' });
  }

  const meta = await table.get(householdMetaKey(householdId), HouseholdMetaItemSchema);
  const rev = meta?.rev ?? 0;
  const snapshot: IChangesResponse = { rev, snapshot: true };
  if (since.status === 'none' || since.since > rev || rev - since.since > CHANGES_LIMIT) {
    return jsonResponse(200, snapshot);
  }
  if (since.since === rev) {
    return jsonResponse(200, { rev, changes: [] } satisfies IChangesResponse);
  }

  const rows = await table.query(
    {
      ConsistentRead: true,
      KeyConditionExpression: RANGE_CONDITION,
      ExpressionAttributeValues: {
        ':pk': changeKey({ householdId, rev }).PK,
        ':from': changeKey({ householdId, rev: since.since + 1 }).SK,
        ':to': changeKey({ householdId, rev }).SK,
      },
    },
    ChangeItemSchema,
  );
  if (rows.length !== rev - since.since) {
    return jsonResponse(200, snapshot);
  }
  return jsonResponse(200, {
    rev,
    changes: rows.map(({ rev: changeRev, type, id }) => ({ rev: changeRev, type, id })),
  } satisfies IChangesResponse);
};
