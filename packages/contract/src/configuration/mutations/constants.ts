export enum MutationName {
  startSignIn = 'startSignIn',
  verifyCode = 'verifyCode',
  signOut = 'signOut',
  setUsername = 'setUsername',
}

export const CONFIGURABLE_MUTATION_NAMES = [MutationName.signOut] as const;

export const NON_RETRYABLE_MUTATION_NAMES = [
  MutationName.startSignIn,
  MutationName.verifyCode,
  MutationName.setUsername,
];

export const MUTATION_BOUNDS = {
  retry: { min: 0, max: 2 },
} as const;
