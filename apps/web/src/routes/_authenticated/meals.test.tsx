import { Meals } from '../../pages/Meals';
import { Route } from './meals';

describe('authenticated meals route', () => {
  it('renders Meals', () => {
    expect(Route.options.component).toBe(Meals);
  });
});
