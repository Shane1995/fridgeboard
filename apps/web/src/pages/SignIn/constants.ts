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
  passkey: {
    title: 'Welcome back',
    intro: 'Sign in as',
    submit: 'Sign in with a passkey',
    signingIn: 'Checking…',
    useCode: 'Use an email code instead',
    cancelled: 'Passkey sign-in was cancelled. Try again or use an email code.',
    noPasskey: 'No passkey found for this email. Use "Email me a code" instead.',
    emailRequired: 'Enter your email first.',
  },
  reasons: {
    'no-invite': 'No invite found for this email. Ask whoever invited you to send one.',
    'verify-email':
      'Open the email from Amazon Web Services and tap its link first, then try again.',
    'bad-code': "That code isn't right. Check the email and try again.",
    expired: 'That code has expired.',
    forbidden: "This account can't use Fridgeboard.",
    unauthorised: 'Please sign in again.',
    'recent-code-required': 'For safety, sign in with an email code first, then try again.',
    'passkey-failed': "That passkey didn't work. Use an email code instead.",
    unknown: 'Something went wrong. Please try again.',
  } satisfies Record<FailureReason, string>,
} as const;

export const CODE_PATTERN = '\\d{6,8}';
export const EMAIL_MARKER = '@';
