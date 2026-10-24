export type JoinState = {
  email: string | undefined;
  showHint: boolean;
  dismissHint: () => void;
};
