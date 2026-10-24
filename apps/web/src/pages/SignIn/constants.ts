import { FailureReason } from '../../services/session/constants';

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
    emailRequired: 'Enter your email first.',
  },
  reasons: {
    [FailureReason.NoInvite]:
      'No invite found for this email. Ask whoever invited you to send one.',
    [FailureReason.VerifyEmail]:
      'Open the email from Amazon Web Services and tap its link first, then try again.',
    [FailureReason.BadCode]: "That code isn't right. Check the email and try again.",
    [FailureReason.Expired]: 'That code has expired.',
    [FailureReason.Forbidden]: "This account can't use Fridgeboard.",
    [FailureReason.Unauthorised]: 'Please sign in again.',
    [FailureReason.RecentCodeRequired]:
      'For safety, sign in with an email code first, then try again.',
    [FailureReason.PasskeyFailed]: "That passkey didn't work. Use an email code instead.",
    [FailureReason.Unknown]: 'Something went wrong. Please try again.',
    [FailureReason.Cancelled]: 'Passkey sign-in was cancelled. Try again or use an email code.',
    [FailureReason.Fallback]: 'No passkey found for this email. Use "Email me a code" instead.',
  } satisfies Record<FailureReason, string>,
} as const;

export const CODE_PATTERN = '\\d{6,8}';
export const EMAIL_MARKER = '@';
