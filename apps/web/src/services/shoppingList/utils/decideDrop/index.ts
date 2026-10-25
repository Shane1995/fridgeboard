import { UNSORTED_SHOP_ID } from '../../constants';
import type { DecideDropOptions, DropDecision } from './types';

export const decideDrop = ({ item, fromShopId, toShopId }: DecideDropOptions): DropDecision => {
  if (fromShopId === toShopId) {
    return { kind: 'none' };
  }
  if (toShopId === UNSORTED_SHOP_ID) {
    return { kind: 'unassign' };
  }
  if (fromShopId === UNSORTED_SHOP_ID) {
    return { kind: 'assign' };
  }
  return item.shopIds.includes(toShopId) ? { kind: 'already' } : { kind: 'ask' };
};
