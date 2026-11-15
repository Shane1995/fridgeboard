import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IChangesResponse } from '@fridgeboard/contract/changes';
import { isMember } from '@fridgeboard/lambda-kit/repository/households/isMember/index.ts';
import {
  getHouseholdRev,
  queryChanges,
} from '@fridgeboard/lambda-kit/repository/households/index.ts';
import { jsonResponse } from '@fridgeboard/lambda-kit/utils/jsonResponse/index.ts';
import { readSince } from '../../utils/readSince/index.ts';
import { ID_PATTERN } from '@fridgeboard/lambda-kit/utils/resolveList/constants.ts';
import { createTable } from '@fridgeboard/lambda-kit/utils/table/index.ts';
import type { AuthenticatedUser } from '@fridgeboard/lambda-kit/utils/withAuthenticatedUser/types.ts';
import { CHANGES_LIMIT } from './constants.ts';

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

  const rev = await getHouseholdRev({ table, householdId });
  const snapshot: IChangesResponse = { rev, snapshot: true };
  if (since.status === 'none' || since.since > rev || rev - since.since > CHANGES_LIMIT) {
    return jsonResponse(200, snapshot);
  }
  if (since.since === rev) {
    return jsonResponse(200, { rev, changes: [] } satisfies IChangesResponse);
  }

  const rows = await queryChanges({ table, householdId, from: since.since + 1, to: rev });
  if (rows.length !== rev - since.since) {
    return jsonResponse(200, snapshot);
  }
  return jsonResponse(200, {
    rev,
    changes: rows.map(({ rev: changeRev, type, id }) => ({ rev: changeRev, type, id })),
  } satisfies IChangesResponse);
};
