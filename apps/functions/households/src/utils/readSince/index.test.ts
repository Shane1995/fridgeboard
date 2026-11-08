import { readSince } from './index.ts';

describe('readSince', () => {
  it('has no since when the query parameter is missing', () => {
    expect(readSince({ value: undefined })).toEqual({ status: 'none' });
  });

  it('reads a whole number, including zero', () => {
    expect(readSince({ value: '42' })).toEqual({ status: 'ok', since: 42 });
    expect(readSince({ value: '0' })).toEqual({ status: 'ok', since: 0 });
  });

  it.each(['', '-1', '1.5', 'abc', '1e3', '12345678901'])('rejects %j', (value) => {
    expect(readSince({ value })).toEqual({ status: 'invalid' });
  });
});
