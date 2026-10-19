import { WebConfigurationSchema } from '@fridgeboard/contract/configuration/web';
import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import type { WebConfiguration } from '@fridgeboard/contract/configuration/web/types';
import {
  WEB_FEATURE_FLAGS,
  DEFAULT_WEB_FLAGS,
} from '@fridgeboard/contract/configuration/flags/constants';
import { resolveServiceUrl } from '@fridgeboard/contract/configuration/resolveServiceUrl';
import {
  DEFAULT_WEB_SERVICES,
  WEB_SERVICES,
  WebService,
} from '@fridgeboard/contract/configuration/services/constants';
import { CONFIGURABLE_MUTATION_NAMES } from '@fridgeboard/contract/configuration/mutations/constants';
import { MutationEntrySchema } from '@fridgeboard/contract/configuration/mutations';
import { QueryEntrySchema } from '@fridgeboard/contract/configuration/queries';
import { stripUnknownEntryKeys } from '@fridgeboard/contract/configuration/stripUnknownEntryKeys';
import { DEFAULT_ENTRY, QUERY_NAMES } from '@fridgeboard/contract/configuration/queries/constants';
import {
  DEFAULT_WEB_SETTINGS,
  WEB_SETTINGS,
} from '@fridgeboard/contract/configuration/settings/constants';
import { mergeSettings } from '@fridgeboard/contract/configuration/settings/mergeSettings';
import { stripUnknownKeys } from '@fridgeboard/contract/configuration/stripUnknownKeys';
import { stripTopLevelParams } from '@fridgeboard/contract/configuration/stripTopLevelParams';
import { stripUnknownFlags } from '@fridgeboard/contract/configuration/stripUnknownFlags';
import { stripUnknownServices } from '@fridgeboard/contract/configuration/stripUnknownServices';
import { setConfiguration } from './setConfiguration';
import { getStoredConfiguration } from './getStoredConfiguration';
import { CONFIGURATION_PATH, CONFIGURATION_TIMEOUT_MS } from './constants';

const stripUnknown = (raw: unknown): unknown =>
  [
    stripTopLevelParams,
    (value: unknown) => stripUnknownFlags(value, WEB_FEATURE_FLAGS),
    (value: unknown) => stripUnknownServices(value, WEB_SERVICES),
    (value: unknown) => stripUnknownKeys(value, 'settings', WEB_SETTINGS),
    (value: unknown) => stripUnknownKeys(value, 'queries', [...QUERY_NAMES, DEFAULT_ENTRY]),
    (value: unknown) =>
      stripUnknownKeys(value, 'mutations', [...CONFIGURABLE_MUTATION_NAMES, DEFAULT_ENTRY]),
    (value: unknown) =>
      stripUnknownEntryKeys(value, 'queries', Object.keys(QueryEntrySchema.shape)),
    (value: unknown) =>
      stripUnknownEntryKeys(value, 'mutations', Object.keys(MutationEntrySchema.shape)),
  ].reduce((value, strip) => strip(value), raw);

export const getConfiguration = async (): Promise<WebConfiguration> => {
  try {
    const response = await fetch(CONFIGURATION_PATH, {
      signal: AbortSignal.timeout(CONFIGURATION_TIMEOUT_MS),
    });
    if (!response.ok) {
      return DEFAULT_WEB_CONFIGURATION;
    }
    const parsed = WebConfigurationSchema.safeParse(stripUnknown(await response.json()));
    if (!parsed.success) {
      return DEFAULT_WEB_CONFIGURATION;
    }
    const configuration: WebConfiguration = {
      ...parsed.data,
      featureFlags: { ...DEFAULT_WEB_FLAGS, ...parsed.data.featureFlags },
      services: { ...DEFAULT_WEB_SERVICES, ...parsed.data.services },
      settings: mergeSettings(DEFAULT_WEB_SETTINGS, parsed.data.settings),
      queries: { ...parsed.data.queries },
      mutations: { ...parsed.data.mutations },
    };
    setConfiguration(configuration);
    return configuration;
  } catch {
    return DEFAULT_WEB_CONFIGURATION;
  }
};

export const getServicePath = (service: WebService): string => {
  const { services } = getStoredConfiguration();
  try {
    return resolveServiceUrl(services[service], {});
  } catch {
    return resolveServiceUrl(DEFAULT_WEB_SERVICES[service], {});
  }
};
