import { buildImportLabel } from '.';

describe('buildImportLabel', () => {
  it('uses the site name for a link', () => {
    expect(buildImportLabel({ source: 'https://www.bbcgoodfood.com/recipes/x' })).toBe(
      'bbcgoodfood.com',
    );
  });

  it('describes pasted text', () => {
    expect(buildImportLabel({ source: '2 eggs\n1 cup milk' })).toBe('pasted ingredients');
  });
});
