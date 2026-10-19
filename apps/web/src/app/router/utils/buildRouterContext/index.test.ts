import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { queryClient } from '../../../queryClient';
import { refreshSession } from '../../../../services/session/refreshSession';
import { buildRouterContext } from '.';

vi.mock('../../../../services/session/refreshSession', () => ({ refreshSession: vi.fn() }));

describe('buildRouterContext', () => {
  it('carries the query client and the resolved me path', () => {
    const context = buildRouterContext({
      ...DEFAULT_WEB_CONFIGURATION,
      services: {
        ...DEFAULT_WEB_CONFIGURATION.services,
        me: { url: '/api/v2/me' },
      },
    });

    expect(context.queryClient).toBe(queryClient);
    expect(context.mePath).toBe('/api/v2/me');
  });

  it('refreshes the session with the session config', async () => {
    vi.mocked(refreshSession).mockResolvedValue(true);
    const { session } = buildRouterContext(DEFAULT_WEB_CONFIGURATION);

    await expect(session.refresh()).resolves.toBe(true);

    expect(refreshSession).toHaveBeenCalledWith({
      refreshPath: '/api/v1/auth/refresh',
      refreshLeadMs: 60_000,
      refreshMinIntervalMs: 60_000,
    });
  });

  it('reads the signed-in status from the session store', () => {
    const { session } = buildRouterContext(DEFAULT_WEB_CONFIGURATION);

    expect(session.getStatus()).toBe('loading');
  });
});
