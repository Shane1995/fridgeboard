export const STAPLE_WORDS = ['salt', 'oil', 'cumin', 'powder', 'paste'] as const;

export const SHOP_KEYWORDS: readonly { shopId: string; words: readonly string[] }[] = [
  {
    shopId: 'express',
    words: [
      'onion',
      'garlic',
      'pepper',
      'squash',
      'carrot',
      'mushroom',
      'yoghurt',
      'butter',
      'egg',
      'milk',
    ],
  },
  {
    shopId: 'sainsburys',
    words: [
      'mince',
      'chicken',
      'beef',
      'salmon',
      'tomato',
      'tinned',
      'beans',
      'spaghetti',
      'pasta',
      'rice',
      'chocolate',
      'flour',
      'sugar',
      'stock',
    ],
  },
];

export const MAX_ALTERNATIVES = 2;
