import { BUILD_INFO_COPY } from './constants';

export const BuildInfo = () => (
  <p className="text-xs opacity-60">
    {BUILD_INFO_COPY.label} {__BUILD_SHA__}
  </p>
);
