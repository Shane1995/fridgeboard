import {
  CreateEmailIdentityCommand,
  DeleteEmailIdentityCommand,
  GetEmailIdentityCommand,
  NotFoundException,
  SESv2Client,
} from '@aws-sdk/client-sesv2';
import { mockClient } from 'aws-sdk-client-mock';
import { ensureIdentity } from './index.ts';

const sesMock = mockClient(SESv2Client);

describe('ensureIdentity', () => {
  beforeEach(() => {
    sesMock.reset();
  });

  it('creates a missing identity', async () => {
    sesMock
      .on(GetEmailIdentityCommand)
      .rejects(new NotFoundException({ message: 'missing', $metadata: {} }));

    await expect(ensureIdentity('a@b.co')).resolves.toBe('created');
    expect(sesMock.commandCalls(CreateEmailIdentityCommand)).toHaveLength(1);
  });

  it('leaves a verified identity alone', async () => {
    sesMock.on(GetEmailIdentityCommand).resolves({ VerifiedForSendingStatus: true });

    await expect(ensureIdentity('a@b.co')).resolves.toBe('verified');
    expect(sesMock.commandCalls(CreateEmailIdentityCommand)).toHaveLength(0);
  });

  it('recreates an unverified identity', async () => {
    sesMock.on(GetEmailIdentityCommand).resolves({ VerifiedForSendingStatus: false });

    await expect(ensureIdentity('a@b.co')).resolves.toBe('recreated');
    expect(sesMock.commandCalls(DeleteEmailIdentityCommand)).toHaveLength(1);
    expect(sesMock.commandCalls(CreateEmailIdentityCommand)).toHaveLength(1);
  });
});
