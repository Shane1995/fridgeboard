import type { SHOP_COLORS } from './constants.ts';

export type ShopColorName = (typeof SHOP_COLORS)[number];

export type IListItem = {
  id: string;
  name: string;
  shopIds: string[];
  shopId: string;
  checked: boolean;
  createdAt: number;
  addedBy: string;
};

export type IListItemsResponse = { items: IListItem[] };

export type ICreateListItemRequest = { name: string; shopIds?: string[]; shopId?: string };

export type IUpdateListItemRequest = {
  name?: string;
  shopIds?: string[];
  shopId?: string;
  checked?: boolean;
};

export type IShop = { id: string; name: string; color: ShopColorName; order: number };

export type IShopsResponse = { shops: IShop[] };

export type ICreateShopRequest = { name: string; color: ShopColorName };

export type IUpdateShopRequest = { name?: string; color?: ShopColorName };

export type IReorderShopsRequest = { ids: string[] };

export type IHistoryEntry = { name: string; shopIds: string[]; shopId: string; count: number };

export type IHistoryResponse = { entries: IHistoryEntry[] };

export type IListErrorResponse = {
  reason: 'not-found' | 'invalid-name' | 'invalid-shop' | 'invalid-color' | 'invalid-request';
};
