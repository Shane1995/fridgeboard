import { formatAddedAt } from './index';

describe('formatAddedAt', () => {
  it('writes the day and the time', () => {
    const text = formatAddedAt(new Date(2026, 9, 24, 21, 31).getTime());

    expect(text).toContain('24 Oct 2026');
    expect(text).toContain('21:31');
  });
});
