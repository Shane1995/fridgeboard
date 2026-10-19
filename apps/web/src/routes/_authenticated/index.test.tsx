import { QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { createAppRouter } from '../../app/router/utils/createAppRouter';
import { ME_QUERY_KEY } from '../../hooks/useMeQuery/constants';
import { HOME_COPY } from '../../pages/Home/constants';
import { getMe } from '../../services/api/getMe';
import { queryClient } from '../../services/queryClient';
import { SessionStatus } from '../../services/session/constants';
import { getSessionStatus } from '../../services/session/getSessionStatus';
import { Route } from './index';

vi.mock('../../services/api/getMe', () => ({ getMe: vi.fn() }));
vi.mock('../../services/session/getSessionStatus', () => ({ getSessionStatus: vi.fn() }));

const me = {
  sub: 's',
  email: 'a@b.com',
  isAdmin: false,
  canCreateHousehold: false,
  households: [],
};

describe('authenticated index route', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.resetAllMocks();
    vi.mocked(getSessionStatus).mockReturnValue(SessionStatus.SignedIn);
    vi.mocked(getMe).mockResolvedValue(me);
  });

  it('matches / and renders home', async () => {
    const router = createAppRouter(createMemoryHistory({ initialEntries: ['/'] }));
    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    );
    expect(await screen.findByRole('heading', { name: HOME_COPY.title })).toBeInTheDocument();
    expect(router.state.matches.map((match) => match.routeId)).toContain(Route.id);
  });

  it('loads the current user into the query cache before rendering', async () => {
    const router = createAppRouter(createMemoryHistory({ initialEntries: ['/'] }));
    await router.load();
    expect(queryClient.getQueryData(ME_QUERY_KEY)).toEqual(me);
  });
});
