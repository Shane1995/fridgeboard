import type { RecipeIdea } from '../../../../services/recipes/types';

export const DESSERT_IDEAS: readonly RecipeIdea[] = [
  {
    id: 'd1',
    title: 'Gooey chocolate lava cakes',
    site: 'bbcgoodfood.com',
    snippet: 'Ready in 25 minutes with a molten middle.',
    url: 'https://www.bbcgoodfood.com/recipes/chocolate-lava-cakes',
  },
  {
    id: 'd2',
    title: 'Chocolate fridge cake',
    site: 'bbc.co.uk',
    snippet: 'No bake, with biscuit and dark chocolate.',
    url: 'https://www.bbc.co.uk/food/recipes/chocolate-fridge-cake',
  },
  {
    id: 'd3',
    title: 'Easy chocolate mousse',
    site: 'jamieoliver.com',
    snippet: 'Three ingredients and an hour to set.',
    url: 'https://www.jamieoliver.com/recipes/easy-chocolate-mousse',
  },
  {
    id: 'd4',
    title: 'Chocolate and orange tart',
    site: 'deliciousmagazine.co.uk',
    snippet: 'A crisp base with a silky filling.',
    url: 'https://www.deliciousmagazine.co.uk/recipes/chocolate-orange-tart',
  },
  {
    id: 'd5',
    title: 'Double chocolate cookies',
    site: 'sainsburysmagazine.co.uk',
    snippet: 'Chewy in the middle, crisp at the edge.',
    url: 'https://www.sainsburysmagazine.co.uk/recipes/double-chocolate-cookies',
  },
];

export const DINNER_IDEAS: readonly RecipeIdea[] = [
  {
    id: 'n1',
    title: 'One-pan lemon chicken',
    site: 'bbcgoodfood.com',
    snippet: 'Thighs, potatoes and lemon in a single tray.',
    url: 'https://www.bbcgoodfood.com/recipes/one-pan-lemon-chicken',
  },
  {
    id: 'n2',
    title: 'Creamy mushroom pasta',
    site: 'bbc.co.uk',
    snippet: 'On the table in 20 minutes.',
    url: 'https://www.bbc.co.uk/food/recipes/creamy-mushroom-pasta',
  },
  {
    id: 'n3',
    title: 'Sausage and bean casserole',
    site: 'jamieoliver.com',
    snippet: 'A cosy midweek batch cook.',
    url: 'https://www.jamieoliver.com/recipes/sausage-bean-casserole',
  },
  {
    id: 'n4',
    title: 'Salmon traybake with greens',
    site: 'deliciousmagazine.co.uk',
    snippet: 'Minimal washing up.',
    url: 'https://www.deliciousmagazine.co.uk/recipes/salmon-traybake',
  },
  {
    id: 'n5',
    title: 'Veggie fajitas',
    site: 'sainsburysmagazine.co.uk',
    snippet: 'Peppers, onions and a smoky spice mix.',
    url: 'https://www.sainsburysmagazine.co.uk/recipes/veggie-fajitas',
  },
];

export const DESSERT_WORDS = ['chocolate', 'dessert', 'cake', 'sweet', 'pudding'] as const;
