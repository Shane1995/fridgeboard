import { Route } from '../../../../routes/sign-in';

const validate = (search: { redirect?: unknown }) => {
  const validateSearch = Route.options.validateSearch;
  if (typeof validateSearch !== 'function') {
    throw new Error('validateSearch is not a function');
  }
  return validateSearch(search);
};

describe('sign-in route', () => {
  it('keeps a same-origin redirect search param', () => {
    expect(validate({ redirect: '/shopping' })).toEqual({
      redirect: '/shopping',
    });
  });

  it('falls back to / for a cross-origin redirect', () => {
    expect(validate({ redirect: 'https://evil.com' })).toEqual({
      redirect: '/',
    });
  });

  it('falls back to / when no redirect is given', () => {
    expect(validate({})).toEqual({ redirect: '/' });
  });
});
