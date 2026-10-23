import { stripTopLevelParams } from '../../../../packages/contract/src/configuration/stripTopLevelParams/index.ts';

describe('stripTopLevelParams', () => {
  it('drops the top-level params key', () => {
    expect(
      stripTopLevelParams({
        version: 1,
        params: { version: 'v1' },
        services: { me: { url: '/x' } },
      }),
    ).toEqual({ version: 1, services: { me: { url: '/x' } } });
  });

  it('keeps service params', () => {
    const input = {
      services: { me: { url: '/api/{v}', params: { v: 'v1' } } },
    };

    expect(stripTopLevelParams(input)).toEqual(input);
  });

  it.each([
    ['null', null],
    ['a string', 'x'],
    ['an object without params', { version: 1 }],
  ])('returns %s unchanged', (_name, input) => {
    expect(stripTopLevelParams(input)).toBe(input);
  });
});
