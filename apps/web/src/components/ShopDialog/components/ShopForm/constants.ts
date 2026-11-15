export const SHOP_FORM_COPY = {
  nameLabel: 'Name',
  colorLabel: 'Colour',
  create: 'Create shop',
  save: 'Save',
  delete: 'Delete shop',
  confirmTitle: (name: string) => `Delete ${name}?`,
  confirmDescription: 'Items in it stay on the list, under General.',
  confirm: 'Delete',
} as const;
