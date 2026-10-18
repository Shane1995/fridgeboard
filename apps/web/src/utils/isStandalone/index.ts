import { STANDALONE_QUERY } from './constants';

export const isStandalone = (): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia(STANDALONE_QUERY).matches;
