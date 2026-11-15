import type { IListItem } from '@fridgeboard/contract/lists';
import type { ToListItemOptions } from './types.ts';

// The shops of an item are its own, in the order it names them; a shop that no longer exists is
// left out.
export const toListItem = ({
  row: { id, name, shopIds, checked, createdAt, addedBy },
  shops,
}: ToListItemOptions): IListItem => ({
  id,
  name,
  shops: (shopIds ?? []).flatMap((shopId) => shops.filter((shop) => shop.id === shopId)),
  checked,
  createdAt,
  addedBy,
});
