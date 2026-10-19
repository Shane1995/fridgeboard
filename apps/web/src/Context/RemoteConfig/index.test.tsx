import { WebFeatureFlag } from '@fridgeboard/contract/configuration/flags/constants';
import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { getConfiguration } from '../../services/configuration';
import { getStoredConfiguration } from '../../services/configuration/getStoredConfiguration';
import { setConfiguration } from '../../services/configuration/setConfiguration';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';
import { RemoteConfigProvider } from '.';

vi.mock('../../services/configuration', () => ({ getConfiguration: vi.fn() }));

const Probe = () => {
  const { featureFlags } = useRemoteConfig();
  return <p>{String(featureFlags[WebFeatureFlag.ENABLE_ADMIN_INVITES])}</p>;
};

const renderProvider = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RemoteConfigProvider>
        <Probe />
      </RemoteConfigProvider>
    </QueryClientProvider>,
  );

const served = {
  ...DEFAULT_WEB_CONFIGURATION,
  featureFlags: {
    ...DEFAULT_WEB_CONFIGURATION.featureFlags,
    [WebFeatureFlag.ENABLE_ADMIN_INVITES]: true,
  },
};

describe('RemoteConfigProvider', () => {
  afterEach(() => {
    setConfiguration(DEFAULT_WEB_CONFIGURATION);
  });

  it('renders children with the defaults while the configuration loads', () => {
    vi.mocked(getConfiguration).mockReturnValue(new Promise(() => {}));
    renderProvider();

    expect(screen.getByText('false')).toBeInTheDocument();
  });

  it('exposes the served configuration once loaded', async () => {
    vi.mocked(getConfiguration).mockResolvedValue(served);
    renderProvider();

    expect(await screen.findByText('true')).toBeInTheDocument();
  });

  it('keeps the configuration store in sync', async () => {
    vi.mocked(getConfiguration).mockResolvedValue(served);
    renderProvider();

    await waitFor(() => expect(getStoredConfiguration()).toEqual(served));
  });
});
