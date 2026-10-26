export const SHOP_QUICK_ADD_COPY = {
  trigger: (shopName: string) => `Add to ${shopName}`,
  triggerUnassigned: 'Add item',
  placeholder: (shopName: string) => `Add to ${shopName}`,
  placeholderUnassigned: 'Add an item',
  inputLabel: 'New item',
} as const;
