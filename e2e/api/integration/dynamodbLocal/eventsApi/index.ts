import { randomUUID } from 'node:crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '@fridgeboard/fn-events/index.ts';
import { HouseholdRole } from '@fridgeboard/lambda-kit/utils/isHouseholdRole/constants.ts';
import { householdMetaKey } from '@fridgeboard/lambda-kit/utils/keys/householdMetaKey/index.ts';
import { membershipKey } from '@fridgeboard/lambda-kit/utils/keys/membershipKey/index.ts';
import { buildEvent } from '../buildEvent/index.ts';
import { client } from '../client/index.ts';
import { TABLE_NAME } from '../constants.ts';
import { getItem } from '../getItem/index.ts';

export type Member = { sub: string; householdId: string };

export type CallOptions = {
  suffix?: string;
  body?: unknown;
  query?: Record<string, string>;
  eventId?: string;
  resource?: string;
  params?: Record<string, string>;
};

const put = (Item: Record<string, unknown>) =>
  client.send(new PutCommand({ TableName: TABLE_NAME, Item }));

export const seedMember = async (): Promise<Member> => {
  const sub = randomUUID();
  const householdId = randomUUID();
  await put({ ...membershipKey(householdId, sub), role: HouseholdRole.Member });
  await put({ ...householdMetaKey(householdId), name: 'Home' });
  return { sub, householdId };
};

export const call = (
  { sub, householdId }: Member,
  method: string,
  { suffix = '', body, query, eventId, resource = 'events', params = {} }: CallOptions = {},
) =>
  handler(
    buildEvent({
      claims: { sub },
      method,
      path: `/api/v1/households/${householdId}/${resource}${suffix}`,
      pathParameters: { householdId, ...(eventId ? { eventId } : {}), ...params },
      ...(body === undefined ? {} : { body }),
      ...(query === undefined ? {} : { query }),
    }),
  );

export const json = (result: { body?: string | undefined }) => JSON.parse(String(result.body));

export const allDay = (member: Member, startDate: string, endDate: string, title = 'Trip') =>
  call(member, 'POST', {
    body: { title, ownerId: 'household', allDay: true, startDate, endDate },
  });

export const rev = async ({ householdId }: Member) =>
  (await getItem(householdMetaKey(householdId)))?.rev;
