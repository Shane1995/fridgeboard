import { WebService } from '../schema/constants';
import { TEST_WEB_CONFIGURATION } from '../../../testUtils/webConfiguration';
import { UNRESOLVED_ENDPOINT_ERROR } from './constants';
import { resolveEndpoint } from './index';

const { api } = TEST_WEB_CONFIGURATION.services;

describe('resolveEndpoint', () => {
  it('reads the path from the configuration with the given timeout', () => {
    expect(resolveEndpoint({ api, service: WebService.me, timeoutMs: 10_000 })).toEqual({
      path: '/api/v1/me',
      timeoutMs: 10_000,
    });
  });

  it('prefers a per-endpoint timeout', () => {
    const withOverride = { ...api, endpointsConfig: { [WebService.me]: { timeoutMs: 2_000 } } };

    expect(
      resolveEndpoint({ api: withOverride, service: WebService.me, timeoutMs: 10_000 }).timeoutMs,
    ).toBe(2_000);
    expect(
      resolveEndpoint({ api: withOverride, service: WebService.verify, timeoutMs: 10_000 })
        .timeoutMs,
    ).toBe(10_000);
  });

  it('fills the placeholders from the params and encodes them', () => {
    expect(
      resolveEndpoint({
        api,
        service: WebService.listItem,
        timeoutMs: 10_000,
        params: { householdId: 'hh-1', listId: 'main', itemId: 'a b' },
      }).path,
    ).toBe('/api/v1/households/hh-1/lists/main/items/a%20b');
  });

  it('throws when a placeholder is left unfilled', () => {
    expect(() =>
      resolveEndpoint({
        api,
        service: WebService.listItems,
        timeoutMs: 10_000,
        params: { householdId: 'hh-1' },
      }),
    ).toThrow(UNRESOLVED_ENDPOINT_ERROR);
  });
});
