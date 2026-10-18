import { QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createAppRouter } from '../../app/router/utils/createAppRouter';
import { getMe } from '../../services/api/getMe';
import { queryClient } from '../../services/queryClient';
import { SessionStatus } from '../../services/session/constants';
import { getSessionStatus } from '../../services/session/getSessionStatus';
import { signOut } from '../../services/session/signOut';
import { SIGN_IN_COPY } from '../SignIn/constants';
import { HOME_COPY } from './constants';

vi.mock('../../services/api/getMe', () => ({ getMe: vi.fn() }));
vi.mock('../../services/session/getSessionStatus', () => ({ getSessionStatus: vi.fn() }));
vi.mock('../../services/session/signOut', () => ({ signOut: vi.fn() }));

const renderHome = () => {
  const router = createAppRouter(createMemoryHistory({ initialEntries: ['/'] }));
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
