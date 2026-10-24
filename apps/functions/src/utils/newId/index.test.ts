import { newId } from './index.ts';

describe('newId', () => {
  it('sorts by creation time and stays unique within one millisecond', () => {
    const earlier = newId(1_000);
    const later = newId(2_000);

    expect([later, earlier].sort()).toEqual([earlier, later]);
    expect(newId(1_000)).not.toBe(newId(1_000));
    expect(earlier).toMatch(/^[a-z0-9]+$/);
  });
});
