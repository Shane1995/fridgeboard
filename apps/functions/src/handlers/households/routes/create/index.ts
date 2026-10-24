import { randomUUID } from 'node:crypto';
import { type DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import {
  HOUSEHOLD_NAME_MAX_LENGTH,
  HOUSEHOLD_NAME_MIN_LENGTH,
} from '@fridgeboard/contract/households/constants';
import type { ICreateHouseholdResponse } from '@fridgeboard/contract/households';
import { HouseholdRole } from '../../../../utils/isHouseholdRole/constants.ts';
import { jsonResponse } from '../../../../utils/jsonResponse/index.ts';
import { JSON_HEADERS } from '../../../../utils/jsonResponse/constants.ts';
import type { AuthenticatedUser } from '../../../../utils/withAuthenticatedUser/types.ts';
import { ADMIN_GROUP, GROUPS_CLAIM } from '../../../me/constants.ts';
import { parseGroups } from '../../../me/utils/parseGroups/index.ts';
import { LOCATION_HEADER } from '../../constants.ts';
import { buildCreateTransaction } from '../../utils/buildCreateTransaction/index.ts';
import { mapCancellation } from '../../utils/mapCancellation/index.ts';
import { readName } from '../../utils/readName/index.ts';

export const createHousehold = async (
  { claims, event, sub }: AuthenticatedUser,
  client: DynamoDBDocumentClient,
) => {
  const name = readName(event).trim();
  if (name.length < HOUSEHOLD_NAME_MIN_LENGTH || name.length > HOUSEHOLD_NAME_MAX_LENGTH) {
    return jsonResponse(400, { reason: 'invalid-name' });
  }

  const id = randomUUID();
  try {
    await client.send(
      new TransactWriteCommand({
        TransactItems: buildCreateTransaction({
          TableName: process.env.TABLE_NAME,
          id,
          sub,
          name,
          isAdmin: parseGroups(claims[GROUPS_CLAIM]).includes(ADMIN_GROUP),
          now: new Date().toISOString(),
        }),
      }),
    );
  } catch (error) {
    const failure = mapCancellation(error);
    if (failure) {
      return failure;
    }
    throw error;
  }

  const body: ICreateHouseholdResponse = { id, name, role: HouseholdRole.Owner };
  return {
    ...jsonResponse(201, body),
    headers: { ...JSON_HEADERS, [LOCATION_HEADER]: `/api/v1/households/${id}` },
  };
};
