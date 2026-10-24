import type { IShop, IListItem } from '@fridgeboard/contract/lists';

export type UpdateItemsOptions = { update: (items: IListItem[]) => IListItem[] };

export type UpdateShopsOptions = { update: (shops: IShop[]) => IShop[] };
