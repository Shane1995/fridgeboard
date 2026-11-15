import type { ShopIdsOfOptions } from './types';

export const shopIdsOf = ({ shops }: ShopIdsOfOptions): string[] => shops.map(({ id }) => id);
