export const renderStarter = (): Record<string, string> => ({
  'src/index.ts': [
    'export const handler = async (event: unknown): Promise<unknown> => event;',
    '',
  ].join('\n'),
  'src/index.test.ts': [
    "import { handler } from './index.ts';",
    '',
    "describe('handler', () => {",
    "  it('returns the event', async () => {",
    '    const event = { ok: true };',
    '',
    '    expect(await handler(event)).toBe(event);',
    '  });',
    '});',
    '',
  ].join('\n'),
});
