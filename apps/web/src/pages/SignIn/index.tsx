import { Card } from '@heroui/react';
import { Link, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { CodeStep } from './components/CodeStep';
import { EmailStep } from './components/EmailStep';
import { SIGN_IN_COPY } from './constants';
import type { SignInProps } from './types';

export const SignIn = ({ initialEmail, redirectTo, children }: SignInProps) => {
  const router = useRouter();
  const [email, setEmail] = useState<string | undefined>();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <h1 className="font-hand text-center text-6xl text-accent">{SIGN_IN_COPY.logo}</h1>
      {children}
      <Card>
        <Card.Content>
          {email === undefined ? (
            <EmailStep initialEmail={initialEmail} onCodeSent={setEmail} />
          ) : (
            <CodeStep
              email={email}
              onSignedIn={() => router.history.push(redirectTo)}
              onBack={() => setEmail(undefined)}
            />
          )}
        </Card.Content>
      </Card>
      <Link to="/privacy" className="text-center text-sm underline">
        {SIGN_IN_COPY.privacy}
      </Link>
    </main>
  );
};
