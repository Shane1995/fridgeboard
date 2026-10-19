import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { useQueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { queryClient } from '../../app/queryClient';
import { useRemoteConfigContext } from '../../hooks/useRemoteConfigContext';
import { useSessionContext } from '../../hooks/useSessionContext';
import { getConfiguration } from '../../services/configuration';
import { GlobalContextProvider } from '.';

vi.mock('../../services/configuration', () => ({ getConfiguration: vi.fn() }));

const Probe = () => {
  const client = useQueryClient();
  const { version } = useRemoteConfigContext();
  const { status } = useSessionContext();
  return (
    <p>
      {String(client === queryClient)} {version} {status}
    </p>
  );
};

describe('GlobalContextProvider', () => {
  it('provides the query client, remote configuration and session', async () => {
    vi.mocked(getConfiguration).mockReturnValue(new Promise(() => {}));
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );

    render(
      <GlobalContextProvider>
        <Probe />
      </GlobalContextProvider>,
    );

    expect(
      await screen.findByText(`true ${DEFAULT_WEB_CONFIGURATION.version} loading`),
    ).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
