export type PasskeyStepState = {
  errorMessage: string | undefined;
  isPending: boolean;
  handleSignIn: () => void;
};
