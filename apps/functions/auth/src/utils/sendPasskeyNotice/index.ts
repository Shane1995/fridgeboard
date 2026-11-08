import { SendEmailCommand, SESv2Client } from '@aws-sdk/client-sesv2';
import { NOTICE_BODY, NOTICE_SENDER, NOTICE_SUBJECT } from './constants.ts';

const ses = new SESv2Client({});

export const sendPasskeyNotice = async (to: string): Promise<void> => {
  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: NOTICE_SENDER,
      Destination: { ToAddresses: [to] },
      Content: {
        Simple: {
          Subject: { Data: NOTICE_SUBJECT },
          Body: { Text: { Data: NOTICE_BODY } },
        },
      },
    }),
  );
};
