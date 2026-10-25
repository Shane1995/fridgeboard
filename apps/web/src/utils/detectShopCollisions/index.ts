import { closestCenter, pointerWithin, rectIntersection } from '@dnd-kit/core';
import type { CollisionDetection } from '@dnd-kit/core';

const isDropZone = (data: { current?: { type?: string } | undefined }) =>
  data.current?.type === 'shop-drop';

export const detectShopCollisions: CollisionDetection = (args) => {
  if (args.active.data.current?.type === 'item') {
    const zones = args.droppableContainers.filter(({ data }) => isDropZone(data));
    const within = pointerWithin({ ...args, droppableContainers: zones });
    return within.length > 0 ? within : rectIntersection({ ...args, droppableContainers: zones });
  }
  const shops = args.droppableContainers.filter(({ data }) => !isDropZone(data));
  return closestCenter({ ...args, droppableContainers: shops });
};
