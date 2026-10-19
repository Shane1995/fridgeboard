export const USERNAME_COPY = {
  title: 'Pick your username',
  intro: 'This is the name your household sees. You can only set it once for now.',
  label: 'Username',
  hint: '3 to 20 letters, numbers or underscores.',
  submit: 'Continue',
  saving: 'Saving',
  reasons: {
    'invalid-username': 'Use 3 to 20 letters, numbers or underscores.',
    'username-taken': 'That username is taken. Try another.',
    'username-set': 'You already have a username.',
    unknown: 'Something went wrong. Try again.',
  },
} as const;
