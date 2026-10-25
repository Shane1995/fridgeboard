import type { ListItem } from '../../services/shoppingList/types';

type Dragged = { item: ListItem; fromShopId: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isListItem = (value: unknown): value is ListItem =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  Array.isArray(value.shopIds) &&
  typeof value.checked === 'boolean';

export const readDraggedItem = (data: unknown): Dragged | undefined => {
  if (!isRecord(data) || data.type !== 'item') {
    return undefined;
  }
  const { item, fromShopId } = data;
  return isListItem(item) && typeof fromShopId === 'string' ? { item, fromShopId } : undefined;
};

export const readDropShopId = (data: unknown): string | undefined =>
  isRecord(data) && data.type === 'shop-drop' && typeof data.shopId === 'string'
    ? data.shopId
    : undefined;
