import type { Modifier } from '@dnd-kit/core';
import { restrictToVerticalAxis } from './index';

describe('restrictToVerticalAxis', () => {
  it('drops sideways movement and keeps vertical movement and scale', () => {
    const transform = { x: 120, y: -40, scaleX: 1, scaleY: 1 };

    const result = restrictToVerticalAxis({ transform } as Parameters<Modifier>[0]);

    expect(result).toEqual({ x: 0, y: -40, scaleX: 1, scaleY: 1 });
  });
});
