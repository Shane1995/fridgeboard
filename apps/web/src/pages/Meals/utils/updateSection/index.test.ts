import { updateSection } from '.';

const sections = [
  { id: 'a', title: 'A', lines: [] },
  { id: 'b', title: 'B', lines: [] },
];

describe('updateSection', () => {
  it('changes only the matching section', () => {
    const result = updateSection({
      sections,
      sectionId: 'b',
      update: (section) => ({ ...section, title: 'Changed' }),
    });
    expect(result.map((section) => section.title)).toEqual(['A', 'Changed']);
    expect(sections[1]?.title).toBe('B');
  });

  it('leaves the list alone when nothing matches', () => {
    const result = updateSection({
      sections,
      sectionId: 'x',
      update: (section) => ({ ...section, title: 'Changed' }),
    });
    expect(result).toEqual(sections);
  });
});
