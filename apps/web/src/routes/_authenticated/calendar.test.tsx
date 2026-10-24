import { Calendar } from '../../pages/Calendar';
import { Route } from './calendar';

describe('authenticated calendar route', () => {
  it('renders Calendar', () => {
    expect(Route.options.component).toBe(Calendar);
  });
});
