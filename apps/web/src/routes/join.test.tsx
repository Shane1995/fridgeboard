import { SessionContext } from '../Context/Session';
import { createSession } from '../testUtils/createSession';
import { SessionStatus } from '../services/session/constants';
import { RemoteConfigContext } from '../Context/RemoteConfig/context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { SIGN_IN_COPY } from '../pages/SignIn/constants';
import { Route } from './join';
import { TEST_WEB_CONFIGURATION } from '../testUtils/webConfiguration';

const { session } = createSession(SessionStatus.SignedOut);

describe('join route', () => {
  it('renders the join screen with the email from the link', async () => {
    window.history.replaceState(null, '', '/join#email=ann%40example.com');
    const rootRoute = createRootRoute();
    const component = Route.options.component;
    const joinRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/join',
      ...(component && { component }),
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([joinRoute]),
      history: createMemoryHistory({ initialEntries: ['/join'] }),
    });
    render(
      <RemoteConfigContext.Provider value={TEST_WEB_CONFIGURATION}>
        <SessionContext.Provider value={session}>
          <QueryClientProvider client={new QueryClient()}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </SessionContext.Provider>
      </RemoteConfigContext.Provider>,
    );
    expect(await screen.findByLabelText(SIGN_IN_COPY.emailLabel)).toHaveValue('ann@example.com');
  });
});
