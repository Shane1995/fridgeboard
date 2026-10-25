import type { ListItem } from '../../types';
import type { FindDuplicatesOptions } from './types';

const normalised = (name: string) => name.trim().toLowerCase();

export const findDuplicates = ({ item, items }: FindDuplicatesOptions): ListItem[] =>
  item.checked
    ? []
    : items.filter(
        (other) =>
          other.id !== item.id &&
          !other.checked &&
          normalised(other.name) === normalised(item.name),
      );
