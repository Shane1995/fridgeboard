import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { IHouseholdSummary } from '@fridgeboard/contract/households';
import { fetchHouseholdNames } from '../fetchHouseholdNames/index.ts';
import { fetchMemberships } from '../fetchMemberships/index.ts';
import { householdRoles } from '../householdRoles/index.ts';

export const listHouseholds = async (
  client: DynamoDBDocumentClient,
  TableName: string,
  sub: string,
): Promise<IHouseholdSummary[]> => {
  const roles = householdRoles(await fetchMemberships(client, TableName, sub));
  const names = await fetchHouseholdNames(client, TableName, [...roles.keys()]);
  return [...roles].flatMap(([id, role]) => {
    const name = names.get(id);
    return name === undefined ? [] : [{ id, name, role }];
  });
};
