import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@smithy/util-stream';
import { mockClient } from 'aws-sdk-client-mock';
import { Readable } from 'node:stream';

const s3Mock = mockClient(S3Client);

const body = (value: unknown) => ({
  Body: sdkStreamMixin(Readable.from([typeof value === 'string' ? value : JSON.stringify(value)])),
});

const VALID = { version: 1, featureFlags: {}, services: {} };
const WITH_DEFAULTS = { ...VALID, settings: { flowTtlMs: 180_000 } };

const load = async () => {
  vi.resetModules();
  return import('./index.ts');
};

beforeEach(() => {
  s3Mock.reset();
  vi.useFakeTimers();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubEnv('CONFIG_BUCKET', 'bucket-1');
  vi.stubEnv('CONFIG_KEY', undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('getConfiguration', () => {
  it('reads the configured bucket and default key', async () => {
    s3Mock.on(GetObjectCommand).resolves(body(VALID));
    const { getConfiguration } = await load();

    await expect(getConfiguration()).resolves.toEqual(WITH_DEFAULTS);
    expect(s3Mock.commandCalls(GetObjectCommand)[0]?.args[0].input).toEqual({
      Bucket: 'bucket-1',
      Key: 'configuration/lambda/configuration.json',
    });
  });

  it('honours CONFIG_KEY', async () => {
    vi.stubEnv('CONFIG_KEY', 'other.json');
    s3Mock.on(GetObjectCommand).resolves(body(VALID));
    const { getConfiguration } = await load();

    await getConfiguration();

    expect(s3Mock.commandCalls(GetObjectCommand)[0]?.args[0].input.Key).toBe('other.json');
  });

  it('caches for 60 seconds then refetches', async () => {
    s3Mock.on(GetObjectCommand).callsFake(async () => body(VALID));
    const { getConfiguration } = await load();

    await getConfiguration();
    vi.advanceTimersByTime(59_000);
    await getConfiguration();
    expect(s3Mock.commandCalls(GetObjectCommand)).toHaveLength(1);

    vi.advanceTimersByTime(2_000);
    await getConfiguration();
    expect(s3Mock.commandCalls(GetObjectCommand)).toHaveLength(2);
  });

  it('strips unknown flags instead of failing', async () => {
    s3Mock.on(GetObjectCommand).resolves(body({ ...VALID, featureFlags: { REMOVED: true } }));
    const { getConfiguration } = await load();

    await expect(getConfiguration()).resolves.toEqual(WITH_DEFAULTS);
  });

  it('returns defaults when the first fetch fails', async () => {
    s3Mock.on(GetObjectCommand).rejects(new Error('denied'));
    const { getConfiguration } = await load();

    await expect(getConfiguration()).resolves.toEqual(WITH_DEFAULTS);
  });

  it('returns defaults when the object has no body', async () => {
    s3Mock.on(GetObjectCommand).resolves({});
    const { getConfiguration } = await load();

    await expect(getConfiguration()).resolves.toEqual(WITH_DEFAULTS);
  });

  it('keeps the last good copy when a refresh fails or is invalid', async () => {
    s3Mock
      .on(GetObjectCommand)
      .resolvesOnce(body({ ...VALID, services: {} }))
      .rejectsOnce(new Error('boom'))
      .resolves(body('{not json'));
    const { getConfiguration } = await load();
    const first = await getConfiguration();

    vi.advanceTimersByTime(61_000);
    await expect(getConfiguration()).resolves.toBe(first);

    vi.advanceTimersByTime(61_000);
    await expect(getConfiguration()).resolves.toBe(first);
  });

  it('rejects documents that break the schema', async () => {
    s3Mock
      .on(GetObjectCommand)
      .resolves(body({ version: 1, featureFlags: {}, services: {}, x: 1 }));
    const { getConfiguration } = await load();

    await expect(getConfiguration()).resolves.toEqual(WITH_DEFAULTS);
    expect(console.error).toHaveBeenCalled();
  });

  it('merges served settings over the defaults', async () => {
    s3Mock.on(GetObjectCommand).resolves(body({ ...VALID, settings: { flowTtlMs: 90_000 } }));
    const { getConfiguration } = await load();

    await expect(getConfiguration()).resolves.toEqual({
      ...VALID,
      settings: { flowTtlMs: 90_000 },
    });
  });

  it('strips unknown settings instead of failing', async () => {
    s3Mock.on(GetObjectCommand).resolves(body({ ...VALID, settings: { removed: 1 } }));
    const { getConfiguration } = await load();

    await expect(getConfiguration()).resolves.toEqual(WITH_DEFAULTS);
  });

  it('rejects a flow ttl outside its bounds', async () => {
    s3Mock.on(GetObjectCommand).resolves(body({ ...VALID, settings: { flowTtlMs: 1_000 } }));
    const { getConfiguration } = await load();

    await expect(getConfiguration()).resolves.toEqual(WITH_DEFAULTS);
    expect(console.error).toHaveBeenCalled();
  });
});
