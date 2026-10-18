import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import {
  householdIdFromKey,
  householdMetaKey,
  profileKey,
} from '../../../../src/utils/keys/index.ts';
import { fetchMemberships } from '../../../../src/handlers/me/utils/fetchMemberships/index.ts';
import { doc, TABLE_NAME } from '../clients/index.ts';
import { resolveUser } from '../resolveUser/index.ts';

export const runExportUser = async (email: string, directory: string): Promise<string> => {
  const { sub } = await resolveUser(email);
  const { Item: profile } = await doc.send(
    new GetCommand({ TableName: TABLE_NAME, Key: profileKey(sub) }),
  );
  const memberships = await fetchMemberships(doc, TABLE_NAME, sub);
  const withHouseholds = await Promise.all(
    memberships.map(async (membership) => {
      const id = householdIdFromKey(membership['PK']);
      const { Item: household } = id
        ? await doc.send(new GetCommand({ TableName: TABLE_NAME, Key: householdMetaKey(id) }))
        : { Item: undefined };
      return { membership, household };
    }),
  );
  const path = join(directory, `export-${sub}.json`);
  await writeFile(path, JSON.stringify({ sub, profile, memberships: withHouseholds }, null, 2), {
    mode: 0o600,
  });
  return path;
};
