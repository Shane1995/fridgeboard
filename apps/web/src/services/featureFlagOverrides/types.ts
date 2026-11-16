import type { WebFeatureFlag } from '../configuration/schema/constants';

export type FlagOverrides = Partial<Record<WebFeatureFlag, boolean>>;

export type ApplyFlagOverridesOptions = {
  flags: Record<WebFeatureFlag, boolean>;
  overrides: FlagOverrides;
};

export type WriteFlagOverridesOptions = { overrides: FlagOverrides };
