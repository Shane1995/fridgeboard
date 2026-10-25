import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { SIGN_IN_COPY } from '../SignIn/constants';
import { JOIN_COPY } from './constants';
import { Join } from '.';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { SessionStatus } from '../../services/session/constants';

const { session } = createSession(SessionStatus.SignedOut);

const stubDisplayMode = (standalone: boolean) =>
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: standalone && query.includes('standalone'),
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));

const renderJoin = () => {
  const rootRoute = createRootRoute();
  const joinRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/join',
    component: Join,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([joinRoute]),
    history: createMemoryHistory({ initialEntries: ['/join'] }),
  });
  render(
    <TestProviders session={session}>
      <RouterProvider router={router} />
    </TestProviders>,
  );
};

describe('Join', () => {
  beforeEach(() => {
    stubDisplayMode(false);
    window.history.replaceState(null, '', '/join#email=ann%40example.com');
  });
  afterEach(() => vi.unstubAllGlobals());

  it('pre-fills the email from the fragment and removes it from the URL', async () => {
    renderJoin();
    expect(await screen.findByLabelText(SIGN_IN_COPY.emailLabel)).toHaveValue('ann@example.com');
    expect(window.location.hash).toBe('');
    expect(window.location.pathname).toBe('/join');
  });

  it('shows the Add to Home Screen hint in a browser tab and lets it be dismissed', async () => {
    renderJoin();
    expect(await screen.findByText(JOIN_COPY.hint)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: JOIN_COPY.dismiss }));
    expect(screen.queryByText(JOIN_COPY.hint)).not.toBeInTheDocument();
  });

  it('hides the hint when installed', async () => {
    stubDisplayMode(true);
    renderJoin();
    await screen.findByLabelText(SIGN_IN_COPY.emailLabel);
    expect(screen.queryByText(JOIN_COPY.hint)).not.toBeInTheDocument();
  });
});
