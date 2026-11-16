import type { WebFeatureFlag } from '../../configuration/schema/constants';
import type { ApplyFlagOverridesOptions } from '../types';

export const applyFlagOverrides = ({
  flags,
  overrides,
}: ApplyFlagOverridesOptions): Record<WebFeatureFlag, boolean> => ({ ...flags, ...overrides });
