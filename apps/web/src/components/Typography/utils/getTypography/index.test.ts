import { TYPOGRAPHY_STYLES, TypographyVariant } from '../../constants';
import { getTypography } from './index';

describe('getTypography', () => {
  it.each(Object.values(TypographyVariant))('gives %s its own element and classes', (variant) => {
    const { Tag, className } = getTypography(variant);

    expect(Tag).toBe(TYPOGRAPHY_STYLES[variant].tag);
    expect(className).toBe(TYPOGRAPHY_STYLES[variant].className || undefined);
  });

  it('lets `as` change the element without changing the look', () => {
    const { Tag, className } = getTypography(TypographyVariant.Heading3, 'h2');

    expect(Tag).toBe('h2');
    expect(className).toBe(TYPOGRAPHY_STYLES[TypographyVariant.Heading3].className);
  });

  it('appends extra classes after the variant classes', () => {
    expect(getTypography(TypographyVariant.Logo, undefined, 'text-center').className).toBe(
      `${TYPOGRAPHY_STYLES[TypographyVariant.Logo].className} text-center`,
    );
  });

  it('has no class attribute for a plain body', () => {
    expect(getTypography(TypographyVariant.Body).className).toBeUndefined();
  });
});
