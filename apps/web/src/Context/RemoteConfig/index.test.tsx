import { WebFeatureFlag } from '@fridgeboard/contract/configuration/flags/constants';
import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { getConfiguration } from '../../services/configuration';
import { useRemoteConfigContext } from '../../hooks/useRemoteConfigContext';
import { RemoteConfigProvider } from '.';

vi.mock('../../services/configuration', () => ({ getConfiguration: vi.fn() }));

const Probe = () => {
  const { featureFlags } = useRemoteConfigContext();
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
});
