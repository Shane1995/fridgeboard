import { readFileSync } from 'node:fs';
import { LambdaConfigurationSchema } from '../../../functions/src/configuration/lambdaConfigurationSchema/index.ts';
import { WebConfigurationSchema } from '../../../web/src/services/configuration/schema/index.ts';
import { CONFIGURATION_FILE } from '../constants.ts';
import { LAMBDA_CONFIGURATION_FILE } from '../localConfiguration/constants.ts';

export type ConfigurationFile = {
  featureFlags: Record<string, unknown>;
  settings: Record<string, unknown>;
  services: Record<string, unknown> & { api?: { endpoints: Record<string, unknown> } };
};

const read = (file: string): ConfigurationFile => JSON.parse(readFileSync(file, 'utf8'));
const localWeb = read(CONFIGURATION_FILE);
const prodWeb = read('../configuration/web/configuration.json');
const localLambda = read(LAMBDA_CONFIGURATION_FILE);
const prodLambda = read('../configuration/lambda/configuration.json');

describe('local configuration files', () => {
  it('web.json is a valid web configuration', () => {
    expect(WebConfigurationSchema.safeParse(localWeb).success).toBe(true);
  });

  it('web.json has the same flags, endpoints, settings and services as production', () => {
    expect(Object.keys(localWeb.featureFlags)).toEqual(Object.keys(prodWeb.featureFlags));
    expect(Object.keys(localWeb.settings)).toEqual(Object.keys(prodWeb.settings));
    expect(Object.keys(localWeb.services)).toEqual(Object.keys(prodWeb.services));
    expect(Object.keys(localWeb.services.api?.endpoints ?? {})).toEqual(
      Object.keys(prodWeb.services.api?.endpoints ?? {}),
    );
  });

  it('lambda.json is a valid lambda configuration apart from the local service URL', () => {
    expect(LambdaConfigurationSchema.safeParse({ ...localLambda, services: {} }).success).toBe(
      true,
    );
  });

  it('lambda.json has the same flags, settings and services as production', () => {
    expect(Object.keys(localLambda.featureFlags)).toEqual(Object.keys(prodLambda.featureFlags));
    expect(Object.keys(localLambda.settings)).toEqual(Object.keys(prodLambda.settings));
    expect(Object.keys(localLambda.services)).toEqual(Object.keys(prodLambda.services));
  });
});
