import { Home } from '../../pages/Home';
import { Route } from './index';

describe('authenticated index route', () => {
  it('renders Home', () => {
    expect(Route.options.component).toBe(Home);
  });
});
