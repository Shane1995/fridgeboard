export const DUMMY_DAY_LINES: readonly (readonly string[])[] = [
  ['Roast chicken', 'Roast potatoes'],
  ['Spaghetti + mince'],
  ['Leftovers'],
  ['Butternut soup'],
  ['Fish and chips'],
  ['Pizza night'],
  ['Curry', 'Rice'],
];

export const DUMMY_RECIPE_LINKS: Readonly<Record<string, string>> = {
  'Spaghetti + mince': 'mock-bolognese',
  'Butternut soup': 'mock-soup',
};

export const DUMMY_NOTES: readonly { title: string; lines: readonly string[] }[] = [
  { title: 'Veg buy weekly', lines: ['Carrots', 'Onions', 'Butternut'] },
  { title: 'Morning reminders', lines: ['Vitamins'] },
];
