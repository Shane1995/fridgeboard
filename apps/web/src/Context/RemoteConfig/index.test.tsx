import { WebFeatureFlag } from '../../services/configuration/flags/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CONFIGURATION_ERROR_COPY } from '../../components/ConfigurationError/constants';
import { APP_LOADER_COPY } from '../../components/AppLoader/constants';
import { useRemoteConfigContext } from '../../hooks/useRemoteConfigContext';
import { getConfiguration } from '../../services/configuration';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { RemoteConfigProvider } from '.';

vi.mock('../../services/configuration', () => ({ getConfiguration: vi.fn() }));

const Probe = () => {
  const { featureFlags } = useRemoteConfigContext();
  return <p>{String(featureFlags[WebFeatureFlag.ENABLE_ADMIN_INVITES])}</p>;
};

const renderProvider = (
  client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } }),
) => {
  render(
    <QueryClientProvider client={client}>
      <RemoteConfigProvider>
        <Probe />
      </RemoteConfigProvider>
    </QueryClientProvider>,
  );
  return client;
};

const served = {
  ...TEST_WEB_CONFIGURATION,
  featureFlags: {
    ...TEST_WEB_CONFIGURATION.featureFlags,
    [WebFeatureFlag.ENABLE_ADMIN_INVITES]: true,
  },
  queries: { ...TEST_WEB_CONFIGURATION.queries, me: { staleTimeMs: 7_000 } },
};

describe('RemoteConfigProvider', () => {
  beforeEach(() => {
    vi.mocked(getConfiguration).mockReset();
  });

  it('shows the loader and no children while the configuration loads', () => {
    vi.mocked(getConfiguration).mockReturnValue(new Promise(() => {}));
    renderProvider();

    expect(screen.getByRole('status', { name: APP_LOADER_COPY.label })).toBeInTheDocument();
    expect(screen.queryByText('true')).not.toBeInTheDocument();
  });

  it('exposes the served configuration once loaded', async () => {
    vi.mocked(getConfiguration).mockResolvedValue(served);
    renderProvider();

    expect(await screen.findByText('true')).toBeInTheDocument();
  });

  it('shows the error screen on failure and retries from it', async () => {
    vi.mocked(getConfiguration).mockRejectedValue(new Error('down'));
    renderProvider();

    const retry = await screen.findByRole('button', { name: CONFIGURATION_ERROR_COPY.retry });
    vi.mocked(getConfiguration).mockResolvedValue(served);
    fireEvent.click(retry);

    await waitFor(() => expect(screen.getByText('true')).toBeInTheDocument());
  });
});
