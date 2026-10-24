import { BUILD_INFO_COPY } from './constants';
import { Typography } from '../Typography';
import { TypographyVariant } from '../Typography/constants';

export const BuildInfo = () => (
  <Typography variant={TypographyVariant.Caption}>
    {BUILD_INFO_COPY.label} {__BUILD_SHA__}
  </Typography>
);
