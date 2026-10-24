export type PasskeyPromptState = {
  visible: boolean;
  done: boolean;
  message: string | undefined;
  isPending: boolean;
  handleSetUp: () => void;
  handleNotNow: () => void;
  handleDontAsk: () => void;
};
