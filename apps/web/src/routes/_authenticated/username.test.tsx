import { Username } from '../../pages/Username';
import { Route } from './username';

describe('authenticated username route', () => {
  it('renders the Username page', () => {
    expect(Route.options.component).toBe(Username);
  });
});
