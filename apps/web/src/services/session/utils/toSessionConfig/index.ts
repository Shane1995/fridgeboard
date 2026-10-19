import { WEB_SETTING } from '@fridgeboard/contract/configuration/settings/constants';
import { WebService } from '@fridgeboard/contract/configuration/services/constants';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import { resolveServicePath } from '../../../configuration/resolveServicePath';
import type { SessionConfig } from '../../types';

export const toSessionConfig = ({ services, settings }: WebConfiguration): SessionConfig => ({
  refreshPath: resolveServicePath(services, WebService.refresh),
  refreshLeadMs: settings[WEB_SETTING.refreshLeadMs],
  refreshMinIntervalMs: settings[WEB_SETTING.refreshMinIntervalMs],
});
