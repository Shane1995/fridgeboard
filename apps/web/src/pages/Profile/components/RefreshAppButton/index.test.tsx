import { fireEvent, render, screen } from '@testing-library/react';
import { forceAppRefresh } from '../../../../services/appUpdates/forceAppRefresh';
import { REFRESH_APP_COPY } from './constants';
import { RefreshAppButton } from '.';

vi.mock('../../../../services/appUpdates/forceAppRefresh', () => ({
  forceAppRefresh: vi.fn(async () => undefined),
}));

describe('RefreshAppButton', () => {
  it('forces a refresh when pressed', () => {
    render(<RefreshAppButton />);

    fireEvent.click(screen.getByRole('button', { name: REFRESH_APP_COPY.button }));

    expect(forceAppRefresh).toHaveBeenCalledTimes(1);
  });
});
