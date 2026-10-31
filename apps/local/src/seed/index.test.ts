import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { client } from '../client/index.ts';
import { ADMIN_EMAIL, APP_INVITE_EMAIL, MEMBER_INVITE_EMAIL } from '../constants.ts';
import { seed } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('seed', () => {
  it('writes the admin, household, membership, ownership guard and both invites', async () => {
    ddbMock.reset();
    ddbMock.on(PutCommand).resolves({});

    await seed(client);

    const pks = ddbMock.commandCalls(PutCommand).map((call) => call.args[0].input.Item?.PK);
    expect(pks).toHaveLength(7);
    expect(pks).toContain('HH#local-household');
    expect(pks).toContain(`INVITE#${MEMBER_INVITE_EMAIL}`);
    expect(pks).toContain(`INVITE#${APP_INVITE_EMAIL}`);
    const emails = ddbMock.commandCalls(PutCommand).map((call) => call.args[0].input.Item?.email);
    expect(emails).toContain(ADMIN_EMAIL);
  });
});
