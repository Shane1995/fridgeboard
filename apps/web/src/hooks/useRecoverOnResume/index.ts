import { useEffect } from 'react';
import { VISIBILITY_EVENT, VISIBLE } from '../../services/appUpdates/constants';
import { EDITABLE_SELECTOR, ESCAPE_KEY, OPEN_OVERLAY_SELECTOR } from './constants';

// An interruption such as a notification can leave a menu, dialog or drag half open, with the page
// scroll still locked behind it. When the app comes back, press Escape for the user so those close
// the normal way (which also unlocks the scroll), unless they were typing.
export const useRecoverOnResume = (): void => {
  useEffect(() => {
    const recover = () => {
      if (document.visibilityState !== VISIBLE) {
        return;
      }
      const active = document.activeElement;
      if (active instanceof Element && active.matches(EDITABLE_SELECTOR)) {
        return;
      }
      const target = active ?? document.body;
      target.dispatchEvent(new KeyboardEvent('keydown', { key: ESCAPE_KEY, bubbles: true }));
      target.dispatchEvent(new KeyboardEvent('keyup', { key: ESCAPE_KEY, bubbles: true }));
      if (document.querySelector(OPEN_OVERLAY_SELECTOR) === null) {
        document.documentElement.style.removeProperty('overflow');
        document.body.style.removeProperty('overflow');
      }
    };
    document.addEventListener(VISIBILITY_EVENT, recover);
    window.addEventListener('pageshow', recover);
    return () => {
      document.removeEventListener(VISIBILITY_EVENT, recover);
      window.removeEventListener('pageshow', recover);
    };
  }, []);
};
