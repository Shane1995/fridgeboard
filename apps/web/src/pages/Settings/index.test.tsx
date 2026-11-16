import { screen, within } from '@testing-library/react';
import { renderInRouter } from '../../testUtils/renderInRouter';
import { queryClient } from '../../app/queryClient';
import { SessionStatus } from '../../services/session/constants';
import { createSession } from '../../testUtils/createSession';
import { TestProviders } from '../../testUtils/TestProviders';
import { WebFeatureFlag } from '../../services/configuration/schema/constants';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { FEATURE_FLAGS_COPY } from './components/FeatureFlagsSection/constants';
import { SIGN_OUT_COPY } from './components/SignOutButton/constants';
import { INVITE_COPY } from './components/InviteForm/constants';
import { SETTINGS_COPY } from './constants';
import { Settings } from '.';

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

const renderSettings = (config = TEST_WEB_CONFIGURATION) =>
  renderInRouter(
    <TestProviders session={session} client={queryClient} config={config}>
      <Settings />
    </TestProviders>,
  );

describe('Settings', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.resetAllMocks();
  });

  it('shows the username with the email underneath', async () => {
    respondWith([]);
    await renderSettings();
    expect(await screen.findByText('jess')).toBeInTheDocument();
    expect(screen.getByText('jess@example.com')).toBeInTheDocument();
  });

  it('lists each household with the role', async () => {
    respondWith([
      { id: 'h1', name: 'Home', role: 'owner' },
      { id: 'h2', name: 'Parents', role: 'member' },
    ]);
    await renderSettings();
    expect(await screen.findByText('Home')).toBeInTheDocument();
    expect(screen.getByText(SETTINGS_COPY.roles.owner)).toBeInTheDocument();
    expect(screen.getByText('Parents')).toBeInTheDocument();
    expect(screen.getByText(SETTINGS_COPY.roles.member)).toBeInTheDocument();
  });

  it('offers the feature flag switches', async () => {
    respondWith([]);
    await renderSettings();

    expect(await screen.findByRole('region', { name: FEATURE_FLAGS_COPY.title })).toBeVisible();
  });

  it('has the account actions inside the page, including sign out', async () => {
    respondWith([]);
    await renderSettings();

    expect(await screen.findByRole('button', { name: SIGN_OUT_COPY.button })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Refresh app' })).toBeVisible();
  });

  it('says so when there are no households', async () => {
    respondWith([]);
    await renderSettings();
    expect(await screen.findByText(SETTINGS_COPY.noHouseholds)).toBeInTheDocument();
  });

  it('says so when households fail to load', async () => {
    apiFetch.mockImplementation(async ({ path }: { path: string }) =>
      path.endsWith('/households')
        ? new Response('{}', { status: 500 })
        : new Response(JSON.stringify(ME), { status: 200 }),
    );
    await renderSettings();
    expect(
      await screen.findByText(SETTINGS_COPY.loadFailed, undefined, { timeout: 3000 }),
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
      await renderSettings(withMembersFlag(true));

      expect(await screen.findByText('Natassia')).toBeInTheDocument();
      const list = screen.getByRole('list', { name: SETTINGS_COPY.members });
      expect(within(list).getAllByRole('listitem')).toHaveLength(3);
      expect(within(list).getByText(SETTINGS_COPY.roles.owner)).toBeInTheDocument();
    });

    it('marks the signed-in member and names one without a username', async () => {
      respondWith([HOUSEHOLD], MEMBERS);
      await renderSettings(withMembersFlag(true));

      expect(await screen.findByText(SETTINGS_COPY.you)).toBeInTheDocument();
      expect(screen.getByText(SETTINGS_COPY.unnamedMember)).toBeInTheDocument();
    });

    it('offers an invite form next to the members', async () => {
      respondWith([HOUSEHOLD], MEMBERS);
      await renderSettings(withMembersFlag(true));

      expect(await screen.findByRole('button', { name: INVITE_COPY.submit })).toBeInTheDocument();
      expect(screen.getByLabelText(INVITE_COPY.label)).toBeInTheDocument();
    });

    it('is hidden while the feature flag is off', async () => {
      respondWith([HOUSEHOLD], MEMBERS);
      await renderSettings(withMembersFlag(false));

      expect(await screen.findByText('Home')).toBeInTheDocument();
      expect(screen.queryByText('Natassia')).not.toBeInTheDocument();
      expect(screen.queryByText(SETTINGS_COPY.members)).not.toBeInTheDocument();
      expect(screen.queryByText(INVITE_COPY.title)).not.toBeInTheDocument();
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
      await renderSettings(withMembersFlag(true));

      expect(
        await screen.findByText(SETTINGS_COPY.membersLoadFailed, undefined, { timeout: 3000 }),
      ).toBeInTheDocument();
    });
  });
});
