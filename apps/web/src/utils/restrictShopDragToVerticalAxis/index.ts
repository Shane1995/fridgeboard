import type { Modifier } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '../restrictToVerticalAxis';

export const restrictShopDragToVerticalAxis: Modifier = (args) =>
  args.active?.data.current?.type === 'item' ? args.transform : restrictToVerticalAxis(args);
