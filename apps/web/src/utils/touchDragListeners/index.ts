import type { TouchEvent } from 'react';
import { TOUCH_DRAG_IGNORED_SELECTOR } from './constants';
import type { TouchDragListenersOptions } from './types';

export const touchDragListeners = ({ listeners }: TouchDragListenersOptions) => ({
  onTouchStart: (event: TouchEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest(TOUCH_DRAG_IGNORED_SELECTOR)) {
      return;
    }
    listeners?.onTouchStart?.(event);
  },
});
