import type { FailureReason } from '../../services/session/types';

export const SIGN_IN_COPY = {
  logo: 'Fridgeboard',
  emailTitle: 'Sign in',
  emailIntro: "We'll email you a code. No password needed.",
  emailLabel: 'Email',
  sendCode: 'Email me a code',
  sendingCode: 'Sending…',
  codeTitle: 'Enter your code',
  codeIntro: "We've emailed a code to",
  codeLabel: 'Code',
  verify: 'Sign in',
  verifying: 'Checking…',
  resend: 'Send a new code',
  resent: "We've emailed you a new code.",
  confirmed: "You're confirmed. We've emailed you a fresh code.",
  useAnotherEmail: 'Use a different email',
  privacy: 'Privacy notice',
  reasons: {
    'no-invite': 'No invite found for this email. Ask whoever invited you to send one.',
    'verify-email':
      'Open the email from Amazon Web Services and tap its link first, then try again.',
    'bad-code': "That code isn't right. Check the email and try again.",
    expired: 'That code has expired.',
    forbidden: "This account can't use Fridgeboard.",
    unauthorised: 'Please sign in again.',
    unknown: 'Something went wrong. Please try again.',
  } satisfies Record<FailureReason, string>,
} as const;

export const CODE_PATTERN = '\\d{6,8}';
