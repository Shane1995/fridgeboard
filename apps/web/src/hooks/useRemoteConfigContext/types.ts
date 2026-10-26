import type { WebFeatureFlag } from '../../services/configuration/schema/constants';
import type { MutationEntries } from '../../services/configuration/schema/types';
import type { QueryEntries } from '../../services/configuration/schema/types';
import type { ApiService, RealtimeService } from '../../services/configuration/schema/types';
import type { WebSettings } from '../../services/configuration/schema/types';
import type { WEB_CONFIGURATION_VERSION } from '../../services/configuration/schema/constants';

export type WebConfiguration = {
  version: typeof WEB_CONFIGURATION_VERSION;
  featureFlags: Record<WebFeatureFlag, boolean>;
  services: { api: ApiService; realtime?: RealtimeService | undefined };
  settings: WebSettings;
  queries: QueryEntries;
  mutations: MutationEntries;
};
