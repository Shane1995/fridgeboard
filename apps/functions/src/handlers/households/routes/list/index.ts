import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IHouseholdsResponse } from '@fridgeboard/contract/households';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { listHouseholds } from '../../../../utils/listHouseholds/index.ts';
import type { AuthenticatedUser } from '../../../../utils/withAuthenticatedUser/types.ts';

// The signed-in user's households, not every household.
export const listMyHouseholds = async (
  { sub }: AuthenticatedUser,
  client: DynamoDBDocumentClient,
) => {
  const body: IHouseholdsResponse = {
    households: await listHouseholds(client, String(process.env.TABLE_NAME), sub),
  };
  return jsonResponse(200, body);
};
