export const INVITE_COPY = {
  title: 'Invite someone',
  label: 'Email address',
  submit: 'Send invite',
  sending: 'Sending',
  sent: (email: string) => `Invite sent to ${email}. They can sign up with that address.`,
  sentCheckEmail: (email: string) =>
    `Invite sent to ${email}. They will get an email from AWS first to verify their address, then they can sign up.`,
  reasons: {
    'invalid-email': 'Enter a full email address.',
    'not-found': 'You are not a member of this household.',
    'limit-reached': 'This household has used all its invites.',
    'already-invited': 'That address already has an invite waiting.',
    'verification-failed':
      'The invite was saved but the verification email could not be sent. Try again later.',
    unknown: 'Something went wrong. Try again.',
  },
} as const;
