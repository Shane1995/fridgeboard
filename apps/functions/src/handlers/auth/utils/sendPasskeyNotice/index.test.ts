import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2';
import { mockClient } from 'aws-sdk-client-mock';
import { sendPasskeyNotice } from './index.ts';

const sesMock = mockClient(SESv2Client);

describe('sendPasskeyNotice', () => {
  beforeEach(() => sesMock.reset());

  it('emails the account owner from the pinned noreply address', async () => {
    sesMock.on(SendEmailCommand).resolves({});

    await sendPasskeyNotice('jess@example.com');

    const input = sesMock.commandCalls(SendEmailCommand)[0]?.args[0].input;
    expect(input?.FromEmailAddress).toBe('noreply@fridgeboard.uk');
    expect(input?.Destination).toEqual({ ToAddresses: ['jess@example.com'] });
    expect(input?.Content?.Simple?.Subject?.Data).toBe(
      'A passkey was added to your Fridgeboard account',
    );
    expect(input?.Content?.Simple?.Body?.Text?.Data).toContain('If this was not you');
  });
});
