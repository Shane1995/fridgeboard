export type EmailStepProps = {
  initialEmail?: string | undefined;
  onCodeSent: (email: string) => void;
};
