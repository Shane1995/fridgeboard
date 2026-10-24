export const ONBOARDING_COPY = {
  logo: 'Fridgeboard',
  username: {
    title: 'Pick your username',
    intro: 'This is the name your household sees. You can only set it once for now.',
    label: 'Username',
    hint: (min: number, max: number) => `${min} to ${max} letters, numbers or underscores.`,
    submit: 'Continue',
    saving: 'Saving',
    reasons: {
      'invalid-username': 'That username is not valid. Check the rules below the box.',
      'username-taken': 'That username is taken. Try another.',
      'username-set': 'You already have a username.',
      unknown: 'Something went wrong. Try again.',
    },
  },
  household: {
    title: 'Name your household',
    intro: 'Everyone you invite will share this list. You can rename it later.',
    label: 'Household name',
    submit: 'Create household',
    saving: 'Creating',
    reasons: {
      'invalid-name': 'Enter a name between 1 and 40 characters.',
      'not-allowed': 'Your account cannot create a household. Ask for an invite instead.',
      'household-exists': 'You already have a household.',
      unknown: 'Something went wrong. Try again.',
    },
  },
  needsInvite: {
    title: 'Ask for an invite',
    intro: 'Your account is not in a household yet. Ask the person who runs yours to invite you.',
    signOut: 'Sign out',
  },
} as const;
