import { Settings } from '../../pages/Settings';
import { Route } from './settings';

describe('authenticated settings route', () => {
  it('renders Settings', () => {
    expect(Route.options.component).toBe(Settings);
  });
});
