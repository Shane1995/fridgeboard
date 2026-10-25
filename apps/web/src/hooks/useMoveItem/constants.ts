export const MOVE_ITEM_COPY = {
  undo: 'Undo',
  move: 'Move',
  copy: 'Copy',
  alsoIn: (shop: string) => `Also in ${shop}`,
  askTitle: (item: string, from: string) => `${item} is in ${from}`,
  askDescription:
    'Move it, add it to this shop too (one item, ticked off everywhere), or copy it (a separate item)?',
  assigned: (item: string, shop: string) => `${item} is now in ${shop}.`,
  unassigned: (item: string, shop: string) => `Took ${item} out of ${shop}.`,
  moved: (item: string, shop: string) => `Moved ${item} to ${shop}.`,
  added: (item: string, shop: string) => `${item} is now in ${shop} too.`,
  copied: (item: string, shop: string) => `Copied ${item} to ${shop} as a separate item.`,
  already: (item: string, shop: string) => `${item} is already in ${shop}.`,
} as const;
