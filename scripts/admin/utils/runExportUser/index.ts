import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { householdIdFromKey } from '@fridgeboard/lambda-kit/utils/keys/householdIdFromKey/index.ts';
import { householdMetaKey } from '@fridgeboard/lambda-kit/utils/keys/householdMetaKey/index.ts';
import { profileKey } from '@fridgeboard/lambda-kit/utils/keys/profileKey/index.ts';
import { createTable } from '@fridgeboard/lambda-kit/utils/table/index.ts';
import { RawItemSchema } from '@fridgeboard/lambda-kit/utils/items/rawItem/index.ts';
import { membershipQuery } from '@fridgeboard/lambda-kit/utils/membershipQuery/index.ts';
import { TABLE_NAME } from '../clients/constants.ts';
import { doc } from '../clients/index.ts';
import { resolveUser } from '../resolveUser/index.ts';
import { EXCLUSIVE_WRITE_FLAG, EXISTS_ERROR_CODE } from './constants.ts';

export const runExportUser = async (email: string, directory: string): Promise<string> => {
  const { sub } = await resolveUser(email);
  const { Item: profile } = await doc.send(
    new GetCommand({ TableName: TABLE_NAME, Key: profileKey(sub) }),
  );
  const memberships = await createTable(doc, TABLE_NAME).query(membershipQuery(sub), RawItemSchema);
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
    flag: EXCLUSIVE_WRITE_FLAG,
  }).catch((error: unknown) => {
    throw error instanceof Error && 'code' in error && error.code === EXISTS_ERROR_CODE
      ? new Error(`${path} already exists; move or delete it first`)
      : error;
  });
  return path;
};
