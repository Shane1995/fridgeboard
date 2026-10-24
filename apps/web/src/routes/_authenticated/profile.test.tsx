import { Profile } from '../../pages/Profile';
import { Route } from './profile';

describe('authenticated profile route', () => {
  it('renders Profile', () => {
    expect(Route.options.component).toBe(Profile);
  });
});
