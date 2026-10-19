import { WebConfigurationSchema } from '@fridgeboard/contract/configuration/web';
import { validateConfiguration } from './index.ts';

const target = { name: 'web', schema: WebConfigurationSchema };

describe('validateConfiguration', () => {
  it('returns no errors for a valid document', () => {
    expect(validateConfiguration(target, '{"version":1,"featureFlags":{},"services":{}}')).toEqual(
      [],
    );
  });

  it('reports invalid JSON', () => {
    expect(validateConfiguration(target, '{')).toEqual(['web: invalid JSON']);
  });

  it('reports schema violations with their path', () => {
    const errors = validateConfiguration(
      target,
      '{"version":1,"featureFlags":{"TYPO":true},"services":{}}',
    );
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('web: featureFlags');
  });

  it('reports secrets even when the schema passes', () => {
    const errors = validateConfiguration(
      target,
      '{"version":1,"featureFlags":{},"services":{"me":{"url":"/api/x","params":{"token":"t"}}}}',
    );
    expect(errors).toEqual(['web: $.services.me.params.token: key name suggests a secret']);
  });
});
