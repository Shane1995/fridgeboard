export type CodeStepProps = {
  email: string;
  onSignedIn: () => void;
  onBack: () => void;
};

export type CodeFeedback = {
  message: string;
  isError: boolean;
  isExpired: boolean;
};
