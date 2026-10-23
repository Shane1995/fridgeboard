import type { WebFeatureFlag } from '../flags/constants.ts';
import type { MutationEntries } from '../mutations/types.ts';
import type { QueryEntries } from '../queries/types.ts';
import type { ApiService } from '../services/types.ts';
import type { WebSettings } from '../settings/types.ts';
import type { WEB_CONFIGURATION_VERSION } from './constants.ts';

export type WebConfiguration = {
  version: typeof WEB_CONFIGURATION_VERSION;
  featureFlags: Record<WebFeatureFlag, boolean>;
  services: { api: ApiService };
  settings: WebSettings;
  queries: QueryEntries;
  mutations: MutationEntries;
};
