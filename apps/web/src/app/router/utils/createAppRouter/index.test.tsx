import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { APP_LOADER_COPY } from '../../../../components/AppLoader/constants';
import { GlobalContextProvider } from '../../../../Context/Global';
import { HOME_COPY } from '../../../../pages/Home/constants';
import { SIGN_IN_COPY } from '../../../../pages/SignIn/constants';
import { queryClient } from '../../../queryClient';
import { createAppRouter } from './index';

const TOKENS = { accessToken: 'token-1', expiresIn: 900 };
const ME = {
  sub: 's',
  email: 'a@b.com',
  isAdmin: false,
  canCreateHousehold: false,
  households: [],
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status });

const fetchMock = vi.fn<typeof fetch>();

const serve = (refresh: () => Promise<Response>) => {
  fetchMock.mockImplementation(async (input) => {
    switch (input) {
      case API_PATHS.refresh:
        return refresh();
      case API_PATHS.start:
        return new Response(null, { status: 204 });
      case API_PATHS.verify:
        return json(TOKENS);
      case API_PATHS.me:
        return json(ME);
      default:
        return new Response(null, { status: 404 });
    }
  });
};

const renderAt = (path: string) => {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }));
  render(
    <GlobalContextProvider>
      <RouterProvider router={router} />
    </GlobalContextProvider>,
  );
  return router;
};

const signIn = async () => {
  fireEvent.change(await screen.findByLabelText(SIGN_IN_COPY.emailLabel), {
    target: { value: 'a@b.com' },
  });
  fireEvent.click(screen.getByRole('button', { name: SIGN_IN_COPY.sendCode }));
  fireEvent.change(await screen.findByLabelText(SIGN_IN_COPY.codeLabel), {
    target: { value: '12345678' },
  });
  fireEvent.click(screen.getByRole('button', { name: SIGN_IN_COPY.verify }));
};

describe('router', () => {
  beforeEach(() => {
    queryClient.clear();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    serve(async () => new Response(null, { status: 401 }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the signed-in home at / with the account email', async () => {
    serve(async () => json(TOKENS));
    renderAt('/');
    expect(await screen.findByText(`${HOME_COPY.signedInAs} a@b.com`)).toBeInTheDocument();
  });

  it('renders the not-found component for an unknown path', async () => {
    renderAt('/does-not-exist');
    expect(await screen.findByText('Page not found')).toBeInTheDocument();
  });

  it('redirects / to /sign-in when signed out and back to / after sign-in', async () => {
    const router = renderAt('/');
    await signIn();
    expect(await screen.findByText(`${HOME_COPY.signedInAs} a@b.com`)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
    expect(router.history.location.pathname).toBe('/');
  });

  it('sends a signed-out visit to /sign-in carrying the original path', async () => {
    const router = renderAt('/');
    await screen.findByLabelText(SIGN_IN_COPY.emailLabel);
    expect(router.state.location.pathname).toBe('/sign-in');
    expect(router.state.location.search).toEqual({ redirect: '/' });
  });

  it('ignores a cross-origin redirect search param on /sign-in', async () => {
    const router = renderAt('/sign-in?redirect=https%3A%2F%2Fevil.com');
    expect(await screen.findByLabelText(SIGN_IN_COPY.emailLabel)).toBeInTheDocument();
    expect(router.state.location.search).toEqual({ redirect: '/' });
    await signIn();
    expect(await screen.findByText(`${HOME_COPY.signedInAs} a@b.com`)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });

  it('shows the app loader while the session refresh is pending', async () => {
    const release: ((response: Response) => void)[] = [];
    serve(() => new Promise<Response>((resolve) => release.push(resolve)));
    renderAt('/');
    expect(await screen.findByRole('status', { name: APP_LOADER_COPY.label })).toBeInTheDocument();
    release[0]?.(json(TOKENS));
    expect(await screen.findByText(`${HOME_COPY.signedInAs} a@b.com`)).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: APP_LOADER_COPY.label })).not.toBeInTheDocument();
  });
});
