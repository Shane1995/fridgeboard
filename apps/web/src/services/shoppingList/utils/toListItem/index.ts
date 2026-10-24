import type { IListItem } from '@fridgeboard/contract/lists';
import type { ListItem } from '../../types';

export const toListItem = ({
  id,
  name,
  bucketId,
  checked,
  createdAt,
  addedBy,
}: IListItem): ListItem => ({
  id,
  name,
  bucketId,
  checked,
  createdAt,
  addedBy,
});
