import { formatNotices } from '.';

describe('formatNotices', () => {
  it('writes a header then one section per package with its licence text', () => {
    const output = formatNotices([
      {
        name: 'react',
        version: '19.0.0',
        license: 'MIT',
        homepage: 'https://react.dev',
        text: ' MIT text \n',
      },
      { name: 'clsx', version: '2.0.0', license: 'MIT', text: 'clsx text' },
    ]);
    expect(output).toContain('Fridgeboard includes the following third-party software.');
    expect(output).toContain('react@19.0.0 (MIT)\nhttps://react.dev\n\nMIT text');
    expect(output).toContain('clsx@2.0.0 (MIT)\n\nclsx text');
    expect(output.indexOf('react@')).toBeLessThan(output.indexOf('clsx@'));
  });

  it('ends with a single newline', () => {
    expect(formatNotices([])).toMatch(/[^\n]\n$/);
  });
});
