import { Recipes } from '../../pages/Recipes';
import { Route } from './recipes';

describe('authenticated recipes route', () => {
  it('renders Recipes', () => {
    expect(Route.options.component).toBe(Recipes);
  });
});
