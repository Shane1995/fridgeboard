import type { IListItem } from '@fridgeboard/contract/lists';
import type { ListItem } from '../../types';
import { toShop } from '../toShop';

export const toListItem = ({
  id,
  name,
  shops,
  checked,
  createdAt,
  addedBy,
}: IListItem): ListItem => ({
  id,
  name,
  shops: shops.map(toShop),
  checked,
  createdAt,
  addedBy,
});
