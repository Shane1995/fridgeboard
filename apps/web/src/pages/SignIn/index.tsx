import { Card } from '@heroui/react';
import { Link } from '@tanstack/react-router';
import { AppLoader } from '../../components/AppLoader';
import { Typography } from '../../components/Typography';
import { TypographyVariant } from '../../components/Typography/constants';
import { CodeStep } from './components/CodeStep';
import { EmailStep } from './components/EmailStep';
import { PasskeyStep } from './components/PasskeyStep';
import { SIGN_IN_COPY } from './constants';
import { useSignIn } from './hooks/useSignIn';
import type { SignInProps } from './types';

export const SignIn = ({ initialEmail, redirectTo, children }: SignInProps) => {
  const {
    loading,
    codeEmail,
    passkeyEmail,
    emailStepInitialEmail,
    handleCodeSent,
    handleBack,
    handleSignedIn,
    handlePasskeyFallback,
  } = useSignIn({ initialEmail, redirectTo });

  if (loading) {
    return <AppLoader />;
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <Typography variant={TypographyVariant.Logo} className="text-center">
        {SIGN_IN_COPY.logo}
      </Typography>
      {children}
      <Card>
        <Card.Content>
          {codeEmail === undefined && passkeyEmail !== undefined && (
            <PasskeyStep email={passkeyEmail} onFallback={handlePasskeyFallback} />
          )}
          {codeEmail === undefined && passkeyEmail === undefined && (
            <EmailStep initialEmail={emailStepInitialEmail} onCodeSent={handleCodeSent} />
          )}
          {codeEmail !== undefined && (
            <CodeStep email={codeEmail} onSignedIn={handleSignedIn} onBack={handleBack} />
          )}
        </Card.Content>
      </Card>
      <Link to="/privacy" className="text-center text-sm underline">
        {SIGN_IN_COPY.privacy}
      </Link>
    </main>
  );
};
