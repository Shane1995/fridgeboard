import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { membershipKey } from '@fridgeboard/lambda-kit/utils/keys/membershipKey/index.ts';
import { client } from '../client/index.ts';
import { CHANNEL_PREFIX } from '../realtime/constants.ts';
import { TABLE_NAME } from '../constants.ts';
import { decodeToken } from '../decodeToken/index.ts';

export const isMember = async ({
  token,
  channel,
}: {
  token: string | undefined;
  channel: string;
}): Promise<boolean> => {
  const claims = decodeToken(token);
  const householdId = channel.startsWith(CHANNEL_PREFIX)
    ? channel.slice(CHANNEL_PREFIX.length)
    : '';
  if (!claims || householdId === '' || householdId.includes('/')) {
    return false;
  }
  const { PK, SK } = membershipKey(householdId, claims.sub);
  const { Item } = await client.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK, SK } }));
  return Item !== undefined;
};
