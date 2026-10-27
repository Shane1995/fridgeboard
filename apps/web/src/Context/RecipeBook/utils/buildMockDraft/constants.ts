export const FAIL_MARKER = 'fail';

export const MOCK_LINK_INGREDIENTS = [
  { quantity: 2, unit: '', item: 'onions' },
  { quantity: 400, unit: 'g', item: 'tinned tomatoes' },
  { quantity: 2, unit: 'tbsp', item: 'olive oil' },
  { quantity: 1, unit: 'tsp', item: 'salt' },
] as const;

export const MOCK_LINK_STEPS = [
  'Prepare the ingredients.',
  'Cook everything together until done.',
  'Serve hot.',
] as const;
