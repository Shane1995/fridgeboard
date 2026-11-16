import type { ShopColor } from '../../../../services/shoppingList/constants';
import { findOwner } from '../findOwner';
import type { EventColorOptions } from './types';

// The colour an event is drawn in: its own when it has one, otherwise its owner's.
export const eventColor = ({ event, owners }: EventColorOptions): ShopColor =>
  event.color ?? findOwner({ ownerId: event.ownerId, owners }).color;
