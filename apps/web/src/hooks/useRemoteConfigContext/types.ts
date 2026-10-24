import type { WebFeatureFlag } from '../../services/configuration/flags/constants';
import type { MutationEntries } from '../../services/configuration/mutations/types';
import type { QueryEntries } from '../../services/configuration/queries/types';
import type { ApiService } from '../../services/configuration/services/types';
import type { WebSettings } from '../../services/configuration/settings/types';
import type { WEB_CONFIGURATION_VERSION } from '../../services/configuration/webConfigurationSchema/constants';

export type WebConfiguration = {
  version: typeof WEB_CONFIGURATION_VERSION;
  featureFlags: Record<WebFeatureFlag, boolean>;
  services: { api: ApiService };
  settings: WebSettings;
  queries: QueryEntries;
  mutations: MutationEntries;
};
