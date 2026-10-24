import type { IListItem } from '@fridgeboard/contract/lists';
import type { ListItem } from '../../types';

export const toListItem = ({
  id,
  name,
  shopIds,
  checked,
  createdAt,
  addedBy,
}: IListItem): ListItem => ({
  id,
  name,
  shopIds,
  checked,
  createdAt,
  addedBy,
});
