import { flowMaxAge } from './index.ts';

describe('flowMaxAge', () => {
  it('converts the ttl to whole seconds', () => {
    expect(flowMaxAge(180_000)).toBe(180);
  });

  it('rounds a partial second up', () => {
    expect(flowMaxAge(60_500)).toBe(61);
  });
});
