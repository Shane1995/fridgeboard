import { SignIn } from '../SignIn';
import { InstallHint } from './components/InstallHint';
import { useJoin } from './hooks/useJoin';

export const Join = () => {
  const { email, showHint, dismissHint } = useJoin();

  return (
    <SignIn initialEmail={email} redirectTo="/">
      {showHint && <InstallHint onDismiss={dismissHint} />}
    </SignIn>
  );
};
