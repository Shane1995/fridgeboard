import { QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { getMe } from '../../../../services/api/getMe';
import { queryClient } from '../../../../services/queryClient';
import { SessionStatus } from '../../../../services/session/constants';
import { getSessionStatus } from '../../../../services/session/getSessionStatus';
import { refreshSession } from '../../../../services/session/refreshSession';
import { startSignIn } from '../../../../services/session/startSignIn';
import { verifyCode } from '../../../../services/session/verifyCode';
import { HOME_COPY } from '../../../../pages/Home/constants';
import { SIGN_IN_COPY } from '../../../../pages/SignIn/constants';
import { createAppRouter } from './index';

vi.mock('../../../../services/api/getMe', () => ({ getMe: vi.fn() }));
vi.mock('../../../../services/session/getSessionStatus', () => ({ getSessionStatus: vi.fn() }));
vi.mock('../../../../services/session/refreshSession', () => ({ refreshSession: vi.fn() }));
vi.mock('../../../../services/session/startSignIn', () => ({ startSignIn: vi.fn() }));
vi.mock('../../../../services/session/verifyCode', () => ({ verifyCode: vi.fn() }));

const renderAt = (path: string) => {
  const router = createAppRouter(createMemoryHistory({ initialEntries: [path] }));
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
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
    vi.resetAllMocks();
    vi.mocked(getSessionStatus).mockReturnValue(SessionStatus.SignedOut);
    vi.mocked(refreshSession).mockResolvedValue(false);
    vi.mocked(getMe).mockResolvedValue({
      sub: 's',
      email: 'a@b.com',
      isAdmin: false,
      canCreateHousehold: false,
      households: [],
    });
  });

  it('renders the signed-in home at / with the account email', async () => {
    vi.mocked(getSessionStatus).mockReturnValue(SessionStatus.SignedIn);
    renderAt('/');
    expect(await screen.findByText(`${HOME_COPY.signedInAs} a@b.com`)).toBeInTheDocument();
  });

  it('provides the session to the route context', () => {
    const { options } = createAppRouter(createMemoryHistory({ initialEntries: ['/'] }));
    expect(options.context?.session.getStatus()).toBe(SessionStatus.SignedOut);
    expect(options.context?.session.refresh).toBeInstanceOf(Function);
  });

  it('renders the not-found component for an unknown path', async () => {
    renderAt('/does-not-exist');
    expect(await screen.findByText('Page not found')).toBeInTheDocument();
  });

  it('redirects / to /sign-in when signed out and back to / after sign-in', async () => {
    vi.mocked(startSignIn).mockResolvedValue({ ok: true });
    vi.mocked(verifyCode).mockImplementation(async () => {
      vi.mocked(getSessionStatus).mockReturnValue(SessionStatus.SignedIn);
      return { ok: true };
    });
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
    vi.mocked(startSignIn).mockResolvedValue({ ok: true });
    vi.mocked(verifyCode).mockImplementation(async () => {
      vi.mocked(getSessionStatus).mockReturnValue(SessionStatus.SignedIn);
      return { ok: true };
    });
    const router = renderAt('/sign-in?redirect=https%3A%2F%2Fevil.com');
    expect(await screen.findByLabelText(SIGN_IN_COPY.emailLabel)).toBeInTheDocument();
    expect(router.state.location.search).toEqual({ redirect: '/' });
    await signIn();
    expect(await screen.findByText(`${HOME_COPY.signedInAs} a@b.com`)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });
});
