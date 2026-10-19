export type PasskeyDevice = {
  email: string | undefined;
  promptDismissed: boolean;
  remember: (email: string) => void;
  forget: () => void;
  dismissPrompt: () => void;
};
