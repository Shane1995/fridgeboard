export const SPLIT_ITEM_COPY = {
  done: (name: string, count: number) => `Split ${name} into ${count} items, one for each shop.`,
  out: (name: string, shopName: string) => `Split ${name} out of ${shopName}.`,
} as const;
