import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { isMember } from '../../utils/isMember/index.ts';
import { ID_PATTERN } from '../../utils/resolveList/constants.ts';
import { createTable } from '../../utils/table/index.ts';
import { CHANNEL_NAMESPACE, CHANNEL_SEGMENT_COUNT, UNAUTHORIZED_ERROR } from './constants.ts';
import type { SubscribeResponse } from './types.ts';
import { SubscribeEventSchema } from './utils/subscribeEvent/index.ts';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: unknown): Promise<SubscribeResponse> => {
  const parsed = SubscribeEventSchema.safeParse(event);
  if (!parsed.success) {
    return { error: UNAUTHORIZED_ERROR };
  }
  const { segments } = parsed.data.info.channel;
  const [namespace, householdId] = segments;
  if (
    segments.length !== CHANNEL_SEGMENT_COUNT ||
    namespace !== CHANNEL_NAMESPACE ||
    householdId === undefined ||
    !ID_PATTERN.test(householdId)
  ) {
    return { error: UNAUTHORIZED_ERROR };
  }
  const table = createTable(client, String(process.env.TABLE_NAME));
  return (await isMember({ table, householdId, sub: parsed.data.identity.sub }))
    ? null
    : { error: UNAUTHORIZED_ERROR };
};
