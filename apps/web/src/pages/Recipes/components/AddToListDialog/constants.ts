export const ADD_TO_LIST_COPY = {
  title: 'Add to Chop list',
  fewer: 'Fewer servings',
  more: 'More servings',
  servings: 'Servings',
  onList: 'Already on your list',
  suggested: 'Suggested',
  swapTo: 'Swap to',
  shopsLabel: 'Shops for',
  tick: 'Add',
  added: (count: number) => `Added ${count} ${count === 1 ? 'item' : 'items'} to your Chop list`,
  submit: (count: number) => `Add ${count} ${count === 1 ? 'item' : 'items'}`,
} as const;
