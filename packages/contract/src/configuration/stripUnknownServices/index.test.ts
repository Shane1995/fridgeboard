import { stripUnknownServices } from './index.ts';

describe('stripUnknownServices', () => {
  it('drops service names that are not known', () => {
    expect(
      stripUnknownServices({ version: 1, services: { me: { url: '/a' }, gone: { url: '/b' } } }, [
        'me',
      ]),
    ).toEqual({ version: 1, services: { me: { url: '/a' } } });
  });

  it.each([
    ['a non-object', 'text'],
    ['null', null],
    ['no services key', { version: 1 }],
    ['null services', { services: null }],
    ['array services', { services: [] }],
    ['string services', { services: 'x' }],
  ])('returns %s unchanged', (_name, input) => {
    expect(stripUnknownServices(input, ['me'])).toBe(input);
  });
});
