import { RequestTimeoutSchema } from '.';

describe('RequestTimeoutSchema', () => {
  it.each([
    [1_000, true],
    [999, false],
    [30_000, true],
    [30_001, false],
    [1_500.5, false],
  ])('bounds the timeout: %s -> %s', (value, ok) => {
    expect(RequestTimeoutSchema.safeParse(value).success).toBe(ok);
  });
});
