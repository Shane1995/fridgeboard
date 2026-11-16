import { readLocalStorage } from '../../../utils/readLocalStorage';
import { WEB_FEATURE_FLAGS, type WebFeatureFlag } from '../../configuration/schema/constants';
import { FLAG_OVERRIDES_STORAGE_KEY } from '../constants';
import type { FlagOverrides } from '../types';

const isFlag = (name: string): name is WebFeatureFlag => WEB_FEATURE_FLAGS.includes(name);

const parse = (stored: string): unknown => {
  try {
    return JSON.parse(stored);
  } catch {
    return undefined;
  }
};

// Per-device switches kept in storage. Anything unrecognised is dropped, so a stale or tampered
// value can never turn on a flag the app does not know about.
export const readFlagOverrides = (): FlagOverrides => {
  const stored = readLocalStorage(FLAG_OVERRIDES_STORAGE_KEY);
  const parsed = stored === undefined ? undefined : parse(stored);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {};
  }
  const overrides: FlagOverrides = {};
  for (const [name, value] of Object.entries(parsed)) {
    if (isFlag(name) && typeof value === 'boolean') {
      overrides[name] = value;
    }
  }
  return overrides;
};
