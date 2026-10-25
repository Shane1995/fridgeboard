import { screen, within } from '@testing-library/react';
import { renderInRouter } from '../../testUtils/renderInRouter';
import { queryClient } from '../../app/queryClient';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
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

const respondWith = (households: unknown[], members: unknown[] = []) =>
  apiFetch.mockImplementation(async ({ path }: { path: string }) => {
    if (path.endsWith('/members')) {
      return new Response(JSON.stringify({ members }), { status: 200 });
    }
    return path.endsWith('/households')
      ? new Response(JSON.stringify({ households }), { status: 200 })
      : new Response(JSON.stringify(ME), { status: 200 });
  });

const withMembersFlag = (enabled: boolean) => ({
  ...TEST_WEB_CONFIGURATION,
  featureFlags: {
    ...TEST_WEB_CONFIGURATION.featureFlags,
    [WebFeatureFlag.ENABLE_HOUSEHOLD_INVITES]: enabled,
  },
});

const renderProfile = (config = TEST_WEB_CONFIGURATION) =>
  renderInRouter(
    <TestProviders session={session} client={queryClient} config={config}>
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

  describe('members', () => {
    const HOUSEHOLD = { id: 'h1', name: 'Home', role: 'owner' };
    const MEMBERS = [
      { id: 's', username: 'jess', role: 'owner' },
      { id: 'n', username: 'Natassia', role: 'member' },
      { id: 'x', role: 'member' },
    ];

    it('lists the members of the active household with their roles', async () => {
      respondWith([HOUSEHOLD], MEMBERS);
      await renderProfile(withMembersFlag(true));

      expect(await screen.findByText('Natassia')).toBeInTheDocument();
      const list = screen.getByRole('list', { name: PROFILE_COPY.members });
      expect(within(list).getAllByRole('listitem')).toHaveLength(3);
      expect(within(list).getByText(PROFILE_COPY.roles.owner)).toBeInTheDocument();
    });

    it('marks the signed-in member and names one without a username', async () => {
      respondWith([HOUSEHOLD], MEMBERS);
      await renderProfile(withMembersFlag(true));

      expect(await screen.findByText(PROFILE_COPY.you)).toBeInTheDocument();
      expect(screen.getByText(PROFILE_COPY.unnamedMember)).toBeInTheDocument();
    });

    it('is hidden while the feature flag is off', async () => {
      respondWith([HOUSEHOLD], MEMBERS);
      await renderProfile(withMembersFlag(false));

      expect(await screen.findByText('Home')).toBeInTheDocument();
      expect(screen.queryByText('Natassia')).not.toBeInTheDocument();
      expect(screen.queryByText(PROFILE_COPY.members)).not.toBeInTheDocument();
    });

    it('says so when the members fail to load', async () => {
      apiFetch.mockImplementation(async ({ path }: { path: string }) => {
        if (path.endsWith('/members')) {
          return new Response('{}', { status: 500 });
        }
        return path.endsWith('/households')
          ? new Response(JSON.stringify({ households: [HOUSEHOLD] }), { status: 200 })
          : new Response(JSON.stringify(ME), { status: 200 });
      });
      await renderProfile(withMembersFlag(true));

      expect(
        await screen.findByText(PROFILE_COPY.membersLoadFailed, undefined, { timeout: 3000 }),
      ).toBeInTheDocument();
    });
  });
});
