import type { ElementType } from 'react';

export enum TypographyVariant {
  Logo = 'logo',
  PageTitle = 'pageTitle',
  Heading1 = 'heading1',
  Heading2 = 'heading2',
  Heading3 = 'heading3',
  Lead = 'lead',
  Body = 'body',
  Strong = 'strong',
  Caption = 'caption',
}

// Each variant owns its default element and look. Pass `as` to keep the heading level right
// without changing how a variant looks.
export const TYPOGRAPHY_STYLES: Record<TypographyVariant, { tag: ElementType; className: string }> =
  {
    [TypographyVariant.Logo]: { tag: 'h1', className: 'font-hand px-3 text-6xl text-accent' },
    [TypographyVariant.PageTitle]: {
      tag: 'h1',
      className: 'font-hand text-3xl leading-tight text-accent sm:text-4xl md:text-5xl',
    },
    [TypographyVariant.Heading1]: { tag: 'h1', className: 'text-3xl font-semibold' },
    [TypographyVariant.Heading2]: { tag: 'h2', className: 'text-2xl font-semibold' },
    [TypographyVariant.Heading3]: { tag: 'h3', className: 'text-lg font-semibold' },
    [TypographyVariant.Lead]: { tag: 'p', className: 'text-lg' },
    [TypographyVariant.Body]: { tag: 'p', className: '' },
    [TypographyVariant.Strong]: { tag: 'strong', className: 'font-semibold' },
    [TypographyVariant.Caption]: { tag: 'p', className: 'text-xs opacity-60' },
  };
