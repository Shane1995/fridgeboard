import { PENDING_ITEM_PREFIX } from '../../constants';
import type { ListItem } from '../../types';

export const isPendingItem = ({ id }: Pick<ListItem, 'id'>): boolean =>
  id.startsWith(PENDING_ITEM_PREFIX);
