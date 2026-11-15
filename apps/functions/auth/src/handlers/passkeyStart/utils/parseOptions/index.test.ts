import { parseOptions } from './index.ts';

describe('parseOptions', () => {
  it('parses a JSON object', () => {
    expect(parseOptions('{"challenge":"abc"}')).toEqual({ challenge: 'abc' });
  });

  it.each([undefined, '', 'nope', 'null', '[]', '"x"', '7'])('returns undefined for %j', (raw) => {
    expect(parseOptions(raw)).toBeUndefined();
  });
});
