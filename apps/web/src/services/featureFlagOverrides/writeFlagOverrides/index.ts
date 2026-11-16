import { writeLocalStorage } from '../../../utils/writeLocalStorage';
import { FLAG_OVERRIDES_STORAGE_KEY } from '../constants';
import type { WriteFlagOverridesOptions } from '../types';

export const writeFlagOverrides = ({ overrides }: WriteFlagOverridesOptions): void => {
  writeLocalStorage(
    FLAG_OVERRIDES_STORAGE_KEY,
    Object.keys(overrides).length === 0 ? undefined : JSON.stringify(overrides),
  );
};
