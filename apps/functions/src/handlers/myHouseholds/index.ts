import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IHouseholdsResponse } from '@fridgeboard/contract/households';
import { jsonResponse } from '../../utils/jsonResponse/index.ts';
import { listHouseholds } from '../../utils/listHouseholds/index.ts';
import { createTable } from '../../utils/table/index.ts';
import { withAuthenticatedUser } from '../../utils/withAuthenticatedUser/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = withAuthenticatedUser(async ({ sub }) => {
  const body: IHouseholdsResponse = {
    households: await listHouseholds(createTable(client, String(process.env.TABLE_NAME)), sub),
  };
  return jsonResponse(200, body);
});
