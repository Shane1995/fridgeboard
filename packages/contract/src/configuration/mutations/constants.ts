export enum MutationName {
  startSignIn = 'startSignIn',
  verifyCode = 'verifyCode',
  signOut = 'signOut',
  setUsername = 'setUsername',
  createHousehold = 'createHousehold',
}

export const CONFIGURABLE_MUTATION_NAMES = [MutationName.signOut] as const;

export const NON_RETRYABLE_MUTATION_NAMES = [
  MutationName.startSignIn,
  MutationName.verifyCode,
  MutationName.setUsername,
  MutationName.createHousehold,
];

export const MUTATION_BOUNDS = {
  retry: { min: 0, max: 2 },
} as const;
