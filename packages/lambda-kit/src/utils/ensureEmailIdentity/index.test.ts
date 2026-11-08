import {
  CreateEmailIdentityCommand,
  DeleteEmailIdentityCommand,
  GetEmailIdentityCommand,
  NotFoundException,
  SESv2Client,
} from '@aws-sdk/client-sesv2';
import { mockClient } from 'aws-sdk-client-mock';
import { ensureEmailIdentity } from './index.ts';

const sesMock = mockClient(SESv2Client);
const ses = new SESv2Client({});

describe('ensureEmailIdentity', () => {
  beforeEach(() => {
    sesMock.reset();
  });

  it('creates a missing identity', async () => {
    sesMock
      .on(GetEmailIdentityCommand)
      .rejects(new NotFoundException({ message: 'missing', $metadata: {} }));

    await expect(ensureEmailIdentity({ ses, emailIdentity: 'a@b.co' })).resolves.toBe('created');
    expect(sesMock.commandCalls(CreateEmailIdentityCommand)[0]?.args[0].input).toEqual({
      EmailIdentity: 'a@b.co',
    });
  });

  it('leaves a verified identity alone', async () => {
    sesMock.on(GetEmailIdentityCommand).resolves({ VerifiedForSendingStatus: true });

    await expect(ensureEmailIdentity({ ses, emailIdentity: 'a@b.co' })).resolves.toBe('verified');
    expect(sesMock.commandCalls(CreateEmailIdentityCommand)).toHaveLength(0);
  });

  it('recreates an unverified identity so the verification email is sent again', async () => {
    sesMock.on(GetEmailIdentityCommand).resolves({ VerifiedForSendingStatus: false });

    await expect(ensureEmailIdentity({ ses, emailIdentity: 'a@b.co' })).resolves.toBe('recreated');
    expect(sesMock.commandCalls(DeleteEmailIdentityCommand)).toHaveLength(1);
    expect(sesMock.commandCalls(CreateEmailIdentityCommand)).toHaveLength(1);
  });

  it('rethrows any other lookup failure', async () => {
    sesMock.on(GetEmailIdentityCommand).rejects(new Error('boom'));

    await expect(ensureEmailIdentity({ ses, emailIdentity: 'a@b.co' })).rejects.toThrow('boom');
  });
});
