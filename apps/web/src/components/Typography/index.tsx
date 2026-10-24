import { TypographyVariant } from './constants';
import type { TypographyProps } from './types';
import { getTypography } from './utils/getTypography';

export const Typography = ({
  variant = TypographyVariant.Body,
  as,
  className,
  children,
}: TypographyProps) => {
  const { Tag, className: classes } = getTypography(variant, as, className);
  return <Tag className={classes}>{children}</Tag>;
};
