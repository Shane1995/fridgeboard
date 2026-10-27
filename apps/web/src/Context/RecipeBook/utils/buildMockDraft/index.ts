import type { RecipeDraft } from '../../../../services/recipes/types';
import { FAIL_MARKER, MOCK_LINK_INGREDIENTS, MOCK_LINK_STEPS } from './constants';
import type { BuildMockDraftOptions } from './types';

const HTTPS_PATTERN = /^https:\/\//i;

const toTitle = ({ source }: { source: string }): string => {
  const slug = new URL(source).pathname.split('/').filter(Boolean).at(-1) ?? '';
  const words = slug
    .replace(/\.[a-z]+$/i, '')
    .split(/[-_]+/)
    .filter(Boolean);
  return words.length === 0
    ? 'Imported recipe'
    : words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const buildMockDraft = ({ source }: BuildMockDraftOptions): RecipeDraft | undefined => {
  if (HTTPS_PATTERN.test(source)) {
    if (source.toLowerCase().includes(FAIL_MARKER)) {
      return undefined;
    }
    return {
      name: toTitle({ source }),
      sourceUrl: source,
      photoUrl: '',
      servings: 4,
      ingredients: MOCK_LINK_INGREDIENTS.map((ingredient) => ({
        ...ingredient,
        id: crypto.randomUUID(),
      })),
      steps: [...MOCK_LINK_STEPS],
      notes: '',
      tags: [],
    };
  }
  const lines = source
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
  if (lines.length === 0) {
    return undefined;
  }
  return {
    name: 'Pasted recipe',
    sourceUrl: '',
    photoUrl: '',
    servings: 4,
    ingredients: lines.map((item) => ({
      id: crypto.randomUUID(),
      quantity: undefined,
      unit: '',
      item,
    })),
    steps: [],
    notes: '',
    tags: [],
  };
};
