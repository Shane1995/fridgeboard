import { isRedirect } from '@tanstack/react-router';
import { SessionStatus } from '../../../../services/session/constants';
import type { RouterContext } from '../../types';
import { requireSession } from './index';

const makeContext = (statuses: SessionStatus[], refresh = vi.fn().mockResolvedValue(true)) => {
  const getStatus = vi.fn<() => SessionStatus>();
  statuses.slice(0, -1).forEach((status) => getStatus.mockReturnValueOnce(status));
  getStatus.mockReturnValue(statuses.at(-1) ?? SessionStatus.SignedOut);
  const context: Pick<RouterContext, 'session'> = { session: { getStatus, refresh } };
  return { context, refresh };
};

const run = (statuses: SessionStatus[]) => {
  const { context, refresh } = makeContext(statuses);
  return { refresh, result: requireSession({ context, location: { href: '/list?x=1' } }) };
};

describe('requireSession', () => {
  it('passes when signed in without refreshing', async () => {
    const { refresh, result } = run([SessionStatus.SignedIn]);
    await expect(result).resolves.toBeUndefined();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('waits for the initial refresh while loading, then passes', async () => {
    const { refresh, result } = run([SessionStatus.Loading, SessionStatus.SignedIn]);
    await expect(result).resolves.toBeUndefined();
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('redirects to sign-in with the current path when signed out', async () => {
    const { result } = run([SessionStatus.SignedOut]);
    const error = await result.catch((caught: unknown) => caught);
    expect(isRedirect(error)).toBe(true);
    expect(isRedirect(error) && error.options).toMatchObject({
      to: '/sign-in',
      search: { redirect: '/list?x=1' },
    });
  });

  it('redirects when the initial refresh leaves it signed out', async () => {
    const { result } = run([SessionStatus.Loading, SessionStatus.SignedOut]);
    const error = await result.catch((caught: unknown) => caught);
    expect(isRedirect(error)).toBe(true);
  });
});
