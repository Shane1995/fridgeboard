import { screen } from '@testing-library/react';
import { renderInRouter } from '../../testUtils/renderInRouter';
import { queryClient } from '../../app/queryClient';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { PROFILE_COPY } from './constants';
import { Profile } from '.';

const { session, apiFetch } = createSession(SessionStatus.SignedIn);

const ME = {
  sub: 's',
  email: 'jess@example.com',
  username: 'jess',
  isAdmin: false,
  canCreateHousehold: false,
  hasOnboarding: false,
};

const respondWith = (households: unknown[]) =>
  apiFetch.mockImplementation(async ({ path }: { path: string }) =>
    path.endsWith('/households')
      ? new Response(JSON.stringify({ households }), { status: 200 })
      : new Response(JSON.stringify(ME), { status: 200 }),
  );

const renderProfile = () =>
  renderInRouter(
    <TestProviders session={session} client={queryClient}>
      <Profile />
    </TestProviders>,
  );

describe('Profile', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.resetAllMocks();
  });

  it('shows the username with the email underneath', async () => {
    respondWith([]);
    await renderProfile();
    expect(await screen.findByText('jess')).toBeInTheDocument();
    expect(screen.getByText('jess@example.com')).toBeInTheDocument();
  });

  it('lists each household with the role', async () => {
    respondWith([
      { id: 'h1', name: 'Home', role: 'owner' },
      { id: 'h2', name: 'Parents', role: 'member' },
    ]);
    await renderProfile();
    expect(await screen.findByText('Home')).toBeInTheDocument();
    expect(screen.getByText(PROFILE_COPY.roles.owner)).toBeInTheDocument();
    expect(screen.getByText('Parents')).toBeInTheDocument();
    expect(screen.getByText(PROFILE_COPY.roles.member)).toBeInTheDocument();
  });

  it('says so when there are no households', async () => {
    respondWith([]);
    await renderProfile();
    expect(await screen.findByText(PROFILE_COPY.noHouseholds)).toBeInTheDocument();
  });

  it('says so when households fail to load', async () => {
    apiFetch.mockImplementation(async ({ path }: { path: string }) =>
      path.endsWith('/households')
        ? new Response('{}', { status: 500 })
        : new Response(JSON.stringify(ME), { status: 200 }),
    );
    await renderProfile();
    expect(
      await screen.findByText(PROFILE_COPY.loadFailed, undefined, { timeout: 3000 }),
    ).toBeInTheDocument();
  });
});
