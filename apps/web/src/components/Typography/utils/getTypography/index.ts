import type { ElementType } from 'react';
import { TYPOGRAPHY_STYLES, TypographyVariant } from '../../constants';

export const getTypography = (
  variant: TypographyVariant,
  as?: ElementType,
  className?: string,
): { Tag: ElementType; className: string | undefined } => {
  const style = TYPOGRAPHY_STYLES[variant];
  return {
    Tag: as ?? style.tag,
    className: [style.className, className].filter(Boolean).join(' ') || undefined,
  };
};
