import { existsSync } from 'node:fs';
import { TARGETS } from './constants.ts';

describe('validation targets', () => {
  it('names the web and lambda configuration files', () => {
    expect(TARGETS.map((target) => target.name)).toEqual(['web', 'lambda']);
  });

  it.each(TARGETS)('points $name at an existing file with a schema', ({ file, schema }) => {
    expect(existsSync(file)).toBe(true);
    expect(schema.safeParse({}).success).toBe(false);
  });
});
