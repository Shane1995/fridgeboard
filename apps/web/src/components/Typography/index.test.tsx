import { render, screen } from '@testing-library/react';
import { TypographyVariant } from './constants';
import { Typography } from '.';

describe('Typography', () => {
  it('renders a body paragraph by default', () => {
    render(<Typography>text</Typography>);

    expect(screen.getByText('text').tagName).toBe('P');
  });

  it.each([
    [TypographyVariant.Logo, 'H1'],
    [TypographyVariant.Heading1, 'H1'],
    [TypographyVariant.Heading2, 'H2'],
    [TypographyVariant.Heading3, 'H3'],
    [TypographyVariant.Lead, 'P'],
    [TypographyVariant.Strong, 'STRONG'],
    [TypographyVariant.Caption, 'P'],
  ])('renders %s as a %s', (variant, tag) => {
    render(<Typography variant={variant}>text</Typography>);

    expect(screen.getByText('text').tagName).toBe(tag);
  });

  it('renders the element given by `as` and keeps the variant look', () => {
    render(
      <Typography variant={TypographyVariant.Heading3} as="h2" className="mt-2">
        text
      </Typography>,
    );

    const element = screen.getByText('text');
    expect(element.tagName).toBe('H2');
    expect(element).toHaveClass('text-lg', 'font-semibold', 'mt-2');
  });
});
