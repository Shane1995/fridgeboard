import { useEffect, useState } from 'react';
import { isStandalone } from '../../../../utils/isStandalone';
import { readEmailFragment } from '../../../../utils/readEmailFragment';
import type { JoinState } from './types';

// The invite link carries the email in the URL fragment. Read it once, then clear it so it does not
// stay in the address bar or history.
export const useJoin = (): JoinState => {
  const [email] = useState(() => readEmailFragment(window.location.hash));
  const [showHint, setShowHint] = useState(() => !isStandalone());

  useEffect(() => {
    window.history.replaceState(
      window.history.state,
      '',
      window.location.pathname + window.location.search,
    );
  }, []);

  return { email, showHint, dismissHint: () => setShowHint(false) };
};
