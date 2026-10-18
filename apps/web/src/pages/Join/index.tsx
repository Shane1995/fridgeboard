import { useEffect, useState } from 'react';
import { isStandalone } from '../../utils/isStandalone';
import { readEmailFragment } from '../../utils/readEmailFragment';
import { SignIn } from '../SignIn';
import { InstallHint } from './components/InstallHint';

export const Join = () => {
  const [email] = useState(() => readEmailFragment(window.location.hash));
  const [showHint, setShowHint] = useState(() => !isStandalone());

  useEffect(() => {
    window.history.replaceState(
      window.history.state,
      '',
      window.location.pathname + window.location.search,
    );
  }, []);

  return (
    <SignIn initialEmail={email} redirectTo="/">
      {showHint && <InstallHint onDismiss={() => setShowHint(false)} />}
    </SignIn>
  );
};
