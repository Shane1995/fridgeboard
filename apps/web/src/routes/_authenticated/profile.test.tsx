import { Route } from './profile';

const thrownBy = (run: () => unknown): unknown => {
  try {
    run();
  } catch (error) {
    return error;
  }
  return undefined;
};

describe('old profile address', () => {
  it('sends anyone on /profile to settings', () => {
    const thrown = thrownBy(() => Route.options.beforeLoad?.({} as never));

    expect(thrown).toMatchObject({ options: { to: '/settings' } });
  });
});
