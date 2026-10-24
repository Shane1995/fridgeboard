import { screen } from '@testing-library/react';
import { renderInRouter } from '../../testUtils/renderInRouter';
import { Calendar } from './index';
import { CALENDAR_COPY } from './constants';

describe('Calendar', () => {
  it('renders the title and placeholder', async () => {
    await renderInRouter(<Calendar />);
    expect(screen.getByRole('heading', { name: CALENDAR_COPY.title })).toBeInTheDocument();
    expect(screen.getByText(CALENDAR_COPY.placeholder)).toBeInTheDocument();
  });
});
