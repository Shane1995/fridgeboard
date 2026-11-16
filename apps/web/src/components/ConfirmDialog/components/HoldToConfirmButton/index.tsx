import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { CONFIRM_DIALOG_COPY, HOLD_TO_CONFIRM_MS } from '../../constants';
import type { HoldToConfirmButtonProps } from './types';

export const HoldToConfirmButton = ({ onComplete, children }: HoldToConfirmButtonProps) => {
  const [isHolding, setIsHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sawInput = useRef(false);

  const stop = () => {
    clearTimeout(timer.current);
    timer.current = undefined;
    setIsHolding(false);
  };

  const start = () => {
    sawInput.current = true;
    if (timer.current !== undefined) {
      return;
    }
    setIsHolding(true);
    timer.current = setTimeout(() => {
      stop();
      onComplete();
    }, HOLD_TO_CONFIRM_MS);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  const isPressKey = ({ key }: KeyboardEvent) => key === 'Enter' || key === ' ';

  return (
    <button
      type="button"
      aria-description={CONFIRM_DIALOG_COPY.holdHint}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(event) => isPressKey(event) && start()}
      onKeyUp={(event) => isPressKey(event) && stop()}
      onClick={(event) => {
        const isAssistiveClick = !sawInput.current && event.detail === 0;
        sawInput.current = false;
        if (isAssistiveClick) {
          onComplete();
        }
      }}
      onBlur={stop}
      onContextMenu={(event) => event.preventDefault()}
      className="relative min-h-11 cursor-pointer touch-none overflow-hidden rounded-full bg-danger/15 px-5 text-sm font-semibold text-danger outline-none select-none focus-visible:ring-2 focus-visible:ring-danger"
    >
      <span
        aria-hidden
        style={{ transitionDuration: isHolding ? `${HOLD_TO_CONFIRM_MS}ms` : '150ms' }}
        className={`absolute inset-y-0 left-0 bg-danger/40 transition-[width] ease-linear ${isHolding ? 'w-full' : 'w-0'}`}
      />
      <span className="relative">{children}</span>
    </button>
  );
};
