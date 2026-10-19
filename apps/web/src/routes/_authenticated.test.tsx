import { Route } from './_authenticated';

describe('authenticated layout route', () => {
  it('renders a layout component', () => {
    expect(Route.options.component).toBeTypeOf('function');
  });
});
