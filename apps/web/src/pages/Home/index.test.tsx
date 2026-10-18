import { QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getMe } from '../../services/api/getMe';
import { queryClient } from '../../services/queryClient';
import { SessionStatus } from '../../services/session/constants';
import { getSessionStatus } from '../../services/session/getSessionStatus';
import { signOut } from '../../services/session/signOut';
import { SignIn } from '../SignIn';
import { SIGN_IN_COPY } from '../SignIn/constants';
import { HOME_COPY } from './constants';
import { Home } from '.';

vi.mock('../../services/api/getMe', () => ({ getMe: vi.fn() }));
vi.mock('../../services/session/getSessionStatus', () => ({ getSessionStatus: vi.fn() }));
vi.mock('../../services/session/signOut', () => ({ signOut: vi.fn() }));

const renderHome = () => {
  const rootRoute = createRootRoute();
  const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Home });
  const signInRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/sign-in',
    component: () => <SignIn redirectTo="/" />,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([homeRoute, signInRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
};

describe('Home', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.resetAllMocks();
    vi.mocked(getSessionStatus).mockReturnValue(SessionStatus.SignedIn);
    vi.mocked(getMe).mockResolvedValue({
      sub: 's',
      email: 'a@b.com',
      isAdmin: false,
      canCreateHousehold: false,
      households: [],
    });
  });

  it('shows the app name as the heading', async () => {
    renderHome();
    expect(await screen.findByRole('heading', { name: HOME_COPY.title })).toBeInTheDocument();
  });

  it('shows who is signed in', async () => {
    renderHome();
    expect(await screen.findByText(`${HOME_COPY.signedInAs} a@b.com`)).toBeInTheDocument();
  });

  it('shows a disabled add item button', async () => {
    renderHome();
    expect(await screen.findByRole('button', { name: HOME_COPY.addItem })).toBeDisabled();
  });

  it('signs out and returns to the sign-in screen', async () => {
    vi.mocked(signOut).mockImplementation(async () => {
      vi.mocked(getSessionStatus).mockReturnValue(SessionStatus.SignedOut);
    });
    renderHome();
    fireEvent.click(await screen.findByRole('button', { name: HOME_COPY.signOut }));
    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(await screen.findByLabelText(SIGN_IN_COPY.emailLabel)).toBeInTheDocument();
  });
});
