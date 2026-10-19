import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import { resolveServicePath } from '../../../../services/configuration/resolveServicePath';
import { getSessionStatus } from '../../../../services/session/getSessionStatus';
import { refreshSession } from '../../../../services/session/refreshSession';
import { toSessionConfig } from '../../../../services/session/utils/toSessionConfig';
import { queryClient } from '../../../queryClient';
import type { RouterContext } from '../../types';

export const buildRouterContext = (configuration: WebConfiguration): RouterContext => {
  const sessionConfig = toSessionConfig(configuration);
  return {
    queryClient,
    session: { getStatus: getSessionStatus, refresh: () => refreshSession(sessionConfig) },
    mePath: resolveServicePath(configuration.services, WebService.me),
  };
};
