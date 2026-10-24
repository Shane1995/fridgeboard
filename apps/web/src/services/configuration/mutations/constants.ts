export enum MutationName {
  startSignIn = 'startSignIn',
  verifyCode = 'verifyCode',
  signOut = 'signOut',
  setUsername = 'setUsername',
  createHousehold = 'createHousehold',
  signInWithPasskey = 'signInWithPasskey',
  registerPasskey = 'registerPasskey',
}

export const MUTATION_BOUNDS = {
  retry: { min: 0, max: 2 },
} as const;
