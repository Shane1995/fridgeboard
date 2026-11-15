import { useRef, useState } from 'react';
import { SWIPE_DELETE_THRESHOLD_PX, SWIPE_LOCK_PX } from './constants';
import type { SwipeToDeleteOptions, SwipeToDeleteState } from './types';

type Gesture = { startX: number; startY: number; locked: boolean; abandoned: boolean };

// Dragging a row left reveals a delete underneath it. Horizontal intent is decided after a few
// pixels, so a mostly vertical drag is left to scroll the page.
export const useSwipeToDelete = ({
  onDelete,
  enabled,
}: SwipeToDeleteOptions): SwipeToDeleteState => {
  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const gesture = useRef<Gesture | undefined>(undefined);

  const reset = () => {
    gesture.current = undefined;
    setOffset(0);
    setIsSwiping(false);
  };

  return {
    offset,
    isSwiping,
    isArmed: -offset > SWIPE_DELETE_THRESHOLD_PX,
    handlers: {
      onPointerDown: (event) => {
        if (enabled) {
          gesture.current = {
            startX: event.clientX,
            startY: event.clientY,
            locked: false,
            abandoned: false,
          };
        }
      },
      onPointerMove: (event) => {
        const current = gesture.current;
        if (current === undefined || current.abandoned) {
          return;
        }
        const dx = event.clientX - current.startX;
        const dy = event.clientY - current.startY;
        if (!current.locked) {
          if (Math.abs(dy) >= SWIPE_LOCK_PX && Math.abs(dy) > Math.abs(dx)) {
            current.abandoned = true;
            return;
          }
          if (Math.abs(dx) < SWIPE_LOCK_PX) {
            return;
          }
          current.locked = true;
          setIsSwiping(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }
        setOffset(Math.min(0, dx));
      },
      onPointerUp: (event) => {
        const shouldDelete =
          gesture.current?.locked === true && -offset > SWIPE_DELETE_THRESHOLD_PX;
        if (gesture.current?.locked === true) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        reset();
        if (shouldDelete) {
          onDelete();
        }
      },
      onPointerCancel: reset,
    },
  };
};
