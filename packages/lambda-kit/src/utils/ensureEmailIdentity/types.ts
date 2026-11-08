import type { SESv2Client } from '@aws-sdk/client-sesv2';

export type EnsureEmailIdentityOptions = { ses: SESv2Client; emailIdentity: string };

export type EmailIdentityState = 'created' | 'recreated' | 'verified';
