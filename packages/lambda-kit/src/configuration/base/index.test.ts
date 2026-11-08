import * as z from 'zod/mini';
import { baseConfigurationShape, serviceSchemaFor } from './index.ts';

describe('baseConfigurationShape', () => {
  it('pins the version', () => {
    const schema = z.strictObject(baseConfigurationShape);

    expect(schema.safeParse({ version: 1 }).success).toBe(true);
    expect(schema.safeParse({ version: 2 }).success).toBe(false);
  });
});

describe('serviceSchemaFor', () => {
  const schema = serviceSchemaFor(z.string());

  it('accepts a url with optional params', () => {
    expect(schema.safeParse({ url: 'https://x.test' }).success).toBe(true);
    expect(schema.safeParse({ url: 'https://x.test', params: { version: 'v1' } }).success).toBe(
      true,
    );
  });

  it.each([{ '1bad': 'v1' }, { version: 'not valid!' }])('rejects params %j', (params) => {
    expect(schema.safeParse({ url: 'https://x.test', params }).success).toBe(false);
  });

  it('rejects unknown keys', () => {
    expect(schema.safeParse({ url: 'https://x.test', extra: 1 }).success).toBe(false);
  });
});
