import { screen } from '@testing-library/react';
import { renderInRouter } from '../../testUtils/renderInRouter';
import { Recipes } from './index';
import { RECIPES_COPY } from './constants';

describe('Recipes', () => {
  it('renders the title and placeholder', async () => {
    await renderInRouter(<Recipes />);
    expect(screen.getByRole('heading', { name: RECIPES_COPY.title })).toBeInTheDocument();
    expect(screen.getByText(RECIPES_COPY.placeholder)).toBeInTheDocument();
  });
});
