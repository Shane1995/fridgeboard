import type { ShopColor } from './constants';

export type Shop = { id: string; name: string; color: ShopColor; order: number };

export type ListItem = {
  id: string;
  name: string;
  shopIds: string[];
  checked: boolean;
  createdAt: number;
  addedBy?: string | undefined;
};

export type HistoryEntry = { name: string; shopIds: string[]; count: number };

export type NewItem = { name: string; shopIds: string[] };
export type ItemChanges = Partial<Pick<ListItem, 'name' | 'shopIds' | 'checked'>>;
export type NewShop = { name: string; color: ShopColor };
export type ShopChanges = Partial<Pick<Shop, 'name' | 'color'>>;

export type ShopSectionData = { shop: Shop; items: ListItem[] };

export type GroupedItems = { sections: ShopSectionData[]; checked: ListItem[] };
