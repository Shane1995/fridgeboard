import { render, screen } from '@testing-library/react';
import { Devtools } from '.';

vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: ({ buttonPosition }: { buttonPosition: string }) => (
    <div data-testid="query-devtools">{buttonPosition}</div>
  ),
}));
vi.mock('@tanstack/react-router-devtools', () => ({
  TanStackRouterDevtools: ({ position }: { position: string }) => (
    <div data-testid="router-devtools">{position}</div>
  ),
}));

describe('Devtools', () => {
  it('puts the query devtools bottom-left', () => {
    render(<Devtools />);
    expect(screen.getByTestId('query-devtools')).toHaveTextContent('bottom-left');
  });

  it('puts the router devtools bottom-right', () => {
    render(<Devtools />);
    expect(screen.getByTestId('router-devtools')).toHaveTextContent('bottom-right');
  });
});
