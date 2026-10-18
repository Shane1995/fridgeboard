import {
  CreateEmailIdentityCommand,
  DeleteEmailIdentityCommand,
  GetEmailIdentityCommand,
  NotFoundException,
  SESv2Client,
} from '@aws-sdk/client-sesv2';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { runInvite } from './index.ts';

const ddbMock = mockClient(DynamoDBDocumentClient);
const sesMock = mockClient(SESv2Client);
const options = { email: ' Jess@Example.com', app: true, admin: false, now: 1000 };

describe('runInvite', () => {
  beforeEach(() => {
    ddbMock.reset();
    sesMock.reset();
  });

  it('writes the invite and creates a missing identity', async () => {
    sesMock
      .on(GetEmailIdentityCommand)
      .rejects(new NotFoundException({ message: 'x', $metadata: {} }));

    const result = await runInvite(options);

    expect(ddbMock.commandCalls(PutCommand)[0]?.args[0].input).toMatchObject({
      TableName: 'fridgeboard',
      Item: { PK: 'INVITE#jess@example.com', type: 'app', expiresAt: 1000 + 604800 },
    });
    expect(sesMock.commandCalls(CreateEmailIdentityCommand)[0]?.args[0].input).toEqual({
      EmailIdentity: 'jess@example.com',
    });
    expect(result).toEqual({
      link: 'https://app.fridgeboard.uk/join#email=jess%40example.com',
      identity: 'created',
    });
  });

  it('leaves a verified identity alone', async () => {
    sesMock.on(GetEmailIdentityCommand).resolves({ VerifiedForSendingStatus: true });

    expect((await runInvite(options)).identity).toBe('verified');
    expect(sesMock.commandCalls(CreateEmailIdentityCommand)).toHaveLength(0);
  });

  it('deletes and re-creates an unverified identity', async () => {
    sesMock.on(GetEmailIdentityCommand).resolves({ VerifiedForSendingStatus: false });

    expect((await runInvite(options)).identity).toBe('recreated');
    expect(sesMock.commandCalls(DeleteEmailIdentityCommand)).toHaveLength(1);
    expect(sesMock.commandCalls(CreateEmailIdentityCommand)).toHaveLength(1);
  });

  it('rethrows other SES errors', async () => {
    sesMock.on(GetEmailIdentityCommand).rejects(new Error('boom'));

    await expect(runInvite(options)).rejects.toThrow('boom');
  });
});
