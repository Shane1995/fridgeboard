import type { PointerEvent } from 'react';

export type SwipeToDeleteOptions = {
  onDelete: () => void;
  enabled: boolean;
};

export type Gesture = {
  startX: number;
  startY: number;
  startedAt: number;
  locked: boolean;
  abandoned: boolean;
};

export type SwipeToDeleteState = {
  offset: number;
  isSwiping: boolean;
  isArmed: boolean;
  handlers: {
    onPointerDown: (event: PointerEvent<HTMLElement>) => void;
    onPointerMove: (event: PointerEvent<HTMLElement>) => void;
    onPointerUp: (event: PointerEvent<HTMLElement>) => void;
    onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
  };
};
