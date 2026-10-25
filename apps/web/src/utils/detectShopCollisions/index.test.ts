import type { CollisionDetection } from '@dnd-kit/core';
import { detectShopCollisions } from './index';

type Args = Parameters<CollisionDetection>[0];

const zone = (id: string, type: string) => ({ id, data: { current: { type } } });
const rect = (top: number, bottom: number) => ({
  top,
  bottom,
  left: 0,
  right: 200,
  width: 200,
  height: bottom - top,
});

const run = ({
  type,
  pointerY,
  containers,
}: {
  type: string;
  pointerY: number;
  containers: ReturnType<typeof zone>[];
}) =>
  detectShopCollisions({
    active: { id: 'a', data: { current: { type } } },
    collisionRect: rect(pointerY - 10, pointerY + 10),
    pointerCoordinates: { x: 50, y: pointerY },
    droppableContainers: containers,
    droppableRects: new Map([
      ['drop:a', rect(0, 100)],
      ['drop:b', rect(120, 220)],
      ['a', rect(0, 100)],
      ['b', rect(120, 220)],
    ]),
  } as unknown as Args).map(({ id }) => String(id));

const containers = [
  zone('drop:a', 'shop-drop'),
  zone('drop:b', 'shop-drop'),
  zone('a', 'shop'),
  zone('b', 'shop'),
];

describe('detectShopCollisions', () => {
  it('picks the card under the pointer when an item is dragged', () => {
    expect(run({ type: 'item', pointerY: 160, containers })).toEqual(['drop:b']);
  });

  it('ignores the shop reorder targets while an item is dragged', () => {
    expect(run({ type: 'item', pointerY: 40, containers })).toEqual(['drop:a']);
  });

  it('falls back to the nearest card when the pointer is in the gap between cards', () => {
    const result = run({ type: 'item', pointerY: 110, containers });

    expect(result.every((id) => id.startsWith('drop:'))).toBe(true);
  });

  it('only considers shop reorder targets when a shop card is dragged', () => {
    const result = run({ type: 'shop', pointerY: 160, containers });

    expect(result[0]).toBe('b');
    expect(result.every((id) => !id.startsWith('drop:'))).toBe(true);
  });
});
