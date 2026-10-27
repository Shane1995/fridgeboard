import type { Recipe } from '../../services/recipes/types';

export const MOCK_PARSE_DELAY_MS = 1500;
export const IMPORT_FAILED_REASON =
  'We could not read a recipe there. Try another link, or paste the ingredients.';
export const IMPORTED_TOAST = 'Imported:';

export const MISSING_RECIPE_BOOK_MESSAGE = 'useRecipeBook must be used inside a RecipeBookProvider';

export const MOCK_RECIPES: readonly Recipe[] = [
  {
    id: 'mock-bolognese',
    name: 'Spaghetti bolognese',
    sourceUrl: 'https://www.bbcgoodfood.com/recipes/classic-spaghetti-bolognese',
    photoUrl: '',
    servings: 4,
    ingredients: [
      { id: 'b1', quantity: 500, unit: 'g', item: 'beef mince' },
      { id: 'b2', quantity: 2, unit: '', item: 'onions' },
      { id: 'b3', quantity: 2, unit: 'cloves', item: 'garlic' },
      { id: 'b4', quantity: 400, unit: 'g', item: 'tinned tomatoes' },
      { id: 'b5', quantity: 2, unit: 'tbsp', item: 'olive oil' },
      { id: 'b6', quantity: 350, unit: 'g', item: 'spaghetti' },
    ],
    steps: [
      'Soften the onions in the oil for 5 minutes, then add the garlic.',
      'Brown the mince, add the tomatoes and simmer for 30 minutes.',
      'Cook the spaghetti and serve with the sauce.',
    ],
    notes: 'Freezes well.',
    tags: ['family', 'batch-cook'],
    isFavourite: true,
  },
  {
    id: 'mock-soup',
    name: 'Butternut squash soup',
    sourceUrl: 'https://www.bbcgoodfood.com/recipes/butternut-squash-soup',
    photoUrl: '',
    servings: 4,
    ingredients: [
      { id: 's1', quantity: 1, unit: '', item: 'butternut squash' },
      { id: 's2', quantity: 1, unit: '', item: 'onion' },
      { id: 's3', quantity: 750, unit: 'ml', item: 'vegetable stock' },
      { id: 's4', quantity: 1, unit: 'tsp', item: 'ground cumin' },
      { id: 's5', quantity: 1, unit: 'tbsp', item: 'olive oil' },
    ],
    steps: [
      'Roast the squash for 30 minutes.',
      'Soften the onion, add the squash, cumin and stock, then simmer.',
      'Blend until smooth.',
    ],
    notes: '',
    tags: ['veggie', 'quick'],
    isFavourite: false,
  },
  {
    id: 'mock-tikka',
    name: 'Chicken tikka traybake',
    sourceUrl: 'https://www.bbc.co.uk/food/recipes/chicken_tikka_traybake',
    photoUrl: '',
    servings: 4,
    ingredients: [
      { id: 't1', quantity: 8, unit: '', item: 'chicken thighs' },
      { id: 't2', quantity: 3, unit: 'tbsp', item: 'tikka paste' },
      { id: 't3', quantity: 150, unit: 'g', item: 'natural yoghurt' },
      { id: 't4', quantity: 2, unit: '', item: 'red peppers' },
      { id: 't5', quantity: 1, unit: '', item: 'red onion' },
    ],
    steps: [
      'Mix the paste and yoghurt, coat the chicken and leave for 20 minutes.',
      'Tip into a tray with the peppers and onion and roast for 40 minutes.',
    ],
    notes: 'Good with rice.',
    tags: ['family'],
    isFavourite: false,
  },
  {
    id: 'mock-brownies',
    name: 'Chocolate brownies',
    sourceUrl: 'https://www.bbcgoodfood.com/recipes/best-ever-chocolate-brownies',
    photoUrl: '',
    servings: 12,
    ingredients: [
      { id: 'c1', quantity: 185, unit: 'g', item: 'dark chocolate' },
      { id: 'c2', quantity: 185, unit: 'g', item: 'butter' },
      { id: 'c3', quantity: 3, unit: '', item: 'eggs' },
      { id: 'c4', quantity: 275, unit: 'g', item: 'caster sugar' },
      { id: 'c5', quantity: 85, unit: 'g', item: 'plain flour' },
    ],
    steps: [
      'Melt the chocolate and butter together and let it cool.',
      'Whisk the eggs and sugar, fold in the chocolate and flour.',
      'Bake for 25 minutes.',
    ],
    notes: '',
    tags: ['dessert'],
    isFavourite: false,
  },
  {
    id: 'mock-chilli',
    name: 'Veggie chilli',
    sourceUrl: 'https://www.bbcgoodfood.com/recipes/vegetarian-chilli',
    photoUrl: '',
    servings: 6,
    ingredients: [
      { id: 'v1', quantity: 2, unit: '', item: 'onions' },
      { id: 'v2', quantity: 2, unit: 'tins', item: 'kidney beans' },
      { id: 'v3', quantity: 400, unit: 'g', item: 'tinned tomatoes' },
      { id: 'v4', quantity: 2, unit: 'tsp', item: 'chilli powder' },
      { id: 'v5', quantity: 1, unit: '', item: 'red pepper' },
    ],
    steps: ['Soften the veg, add the spices, beans and tomatoes, then simmer for 30 minutes.'],
    notes: 'Make a big batch.',
    tags: ['veggie', 'batch-cook'],
    isFavourite: false,
  },
];
