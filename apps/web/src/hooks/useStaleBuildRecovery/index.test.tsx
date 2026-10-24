import { renderHook } from '@testing-library/react';
import { recoverFromStaleBuild } from '../../services/appUpdates/recoverFromStaleBuild';
import { useStaleBuildRecovery } from './index';

vi.mock('../../services/appUpdates/recoverFromStaleBuild', () => ({
  recoverFromStaleBuild: vi.fn(async () => undefined),
}));

describe('useStaleBuildRecovery', () => {
  it('checks for a newer build once when it mounts', () => {
    const { rerender } = renderHook(() => useStaleBuildRecovery());
    rerender();

    expect(recoverFromStaleBuild).toHaveBeenCalledTimes(1);
  });
});
