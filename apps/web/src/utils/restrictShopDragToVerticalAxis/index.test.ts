import type { Modifier } from '@dnd-kit/core';
import { restrictShopDragToVerticalAxis } from './index';

const run = (type: string | undefined) =>
  restrictShopDragToVerticalAxis({
    active: { data: { current: type === undefined ? undefined : { type } } },
    transform: { x: 120, y: -40, scaleX: 1, scaleY: 1 },
  } as unknown as Parameters<Modifier>[0]);

describe('restrictShopDragToVerticalAxis', () => {
  it('keeps a shop card in its column while it is dragged', () => {
    expect(run('shop')).toEqual({ x: 0, y: -40, scaleX: 1, scaleY: 1 });
  });

  it('lets an item move freely, so it can be dropped on any card', () => {
    expect(run('item')).toEqual({ x: 120, y: -40, scaleX: 1, scaleY: 1 });
  });

  it('treats a drag it knows nothing about like a shop card', () => {
    expect(run(undefined)).toEqual({ x: 0, y: -40, scaleX: 1, scaleY: 1 });
  });
});
