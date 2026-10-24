import type { ElementType, PropsWithChildren } from 'react';
import type { TypographyVariant } from './constants';

export type TypographyProps = PropsWithChildren<{
  variant?: TypographyVariant;
  as?: ElementType;
  className?: string;
}>;
