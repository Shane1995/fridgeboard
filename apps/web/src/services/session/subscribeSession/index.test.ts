import { SessionStatus } from '../constants';
import { updateSession } from '../updateSession';
import { subscribeSession } from './index';

describe('subscribeSession', () => {
  it('notifies the listener on every session update until unsubscribed', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSession(listener);

    updateSession({ status: SessionStatus.SignedOut });
    unsubscribe();
    updateSession({ status: SessionStatus.SignedIn });

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
