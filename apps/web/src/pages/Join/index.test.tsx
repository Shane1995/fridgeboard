import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { RemoteConfigContext } from '../../Context/RemoteConfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import { SessionContext } from '../../Context/Session';
import type { SessionContextValue } from '../../Context/Session/types';
import { SessionStatus } from '../../services/session/constants';

const startSignIn = vi.fn();
const verifyCode = vi.fn();
const signOut = vi.fn();
const apiFetch = vi.fn();
const session: SessionContextValue = {
  status: SessionStatus.SignedIn,
  startSignIn,
  verifyCode,
  signOut,
  refresh: vi.fn(),
  apiFetch,
};

const stubDisplayMode = (standalone: boolean) =>
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: standalone && query.includes('standalone'),
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
    <RemoteConfigContext.Provider value={DEFAULT_WEB_CONFIGURATION}>
      <SessionContext.Provider value={session}>
        <QueryClientProvider client={new QueryClient()}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </SessionContext.Provider>
    </RemoteConfigContext.Provider>,
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
