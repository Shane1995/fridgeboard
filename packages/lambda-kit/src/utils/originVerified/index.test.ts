import { ORIGIN_VERIFY_HEADER } from './constants.ts';
import { withVerifiedOrigin } from './index.ts';

const SECRET = 's3cret';

const run = async (headers: Record<string, string>) => {
  const inner = vi.fn().mockResolvedValue({ statusCode: 200 });
  const result = await withVerifiedOrigin(inner)({ headers });
  return { result, inner };
};

describe('withVerifiedOrigin', () => {
  beforeEach(() => {
    vi.stubEnv('API_ORIGIN_SECRET', SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('calls the handler when the secret matches', async () => {
    const { result, inner } = await run({ [ORIGIN_VERIFY_HEADER]: SECRET });

    expect(result).toEqual({ statusCode: 200 });
    expect(inner).toHaveBeenCalledOnce();
  });

  it('returns 403 without calling the handler when the header is missing', async () => {
    const { result, inner } = await run({});

    expect(result.statusCode).toBe(403);
    expect(inner).not.toHaveBeenCalled();
  });

  it('rejects a wrong secret of the same length', async () => {
    const { result } = await run({ [ORIGIN_VERIFY_HEADER]: 's3creX' });

    expect(result.statusCode).toBe(403);
  });

  it('rejects a wrong secret of a different length', async () => {
    const { result } = await run({ [ORIGIN_VERIFY_HEADER]: 's3' });

    expect(result.statusCode).toBe(403);
  });

  it('rejects everything when no secret is configured', async () => {
    vi.stubEnv('API_ORIGIN_SECRET', '');

    const { result } = await run({ [ORIGIN_VERIFY_HEADER]: '' });

    expect(result.statusCode).toBe(403);
  });
});
