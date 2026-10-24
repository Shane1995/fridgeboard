export type SignInState = {
  loading: boolean;
  codeEmail: string | undefined;
  passkeyEmail: string | undefined;
  emailStepInitialEmail: string | undefined;
  handleCodeSent: (email: string) => void;
  handleBack: () => void;
  handleSignedIn: () => void;
  handlePasskeyFallback: () => void;
};
