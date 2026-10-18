import { parseGroups } from './index.ts';

describe('parseGroups', () => {
  it.each([
    ['bracketed string', '[admin]', ['admin']],
    ['bare string', 'admin', ['admin']],
    ['multiple', '[admin staff]', ['admin', 'staff']],
    ['comma separated', 'admin,staff', ['admin', 'staff']],
    ['array', ['admin'], ['admin']],
    ['empty brackets', '[]', []],
    ['missing', undefined, []],
    ['non-string', 5, []],
  ])('parses %s', (_name, input, expected) => {
    expect(parseGroups(input)).toEqual(expected);
  });
});
