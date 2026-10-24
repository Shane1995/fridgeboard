import { act, renderHook } from '@testing-library/react';
import { isStandalone } from '../../../../utils/isStandalone';
import { useJoin } from './index';

vi.mock('../../../../utils/isStandalone', () => ({ isStandalone: vi.fn() }));

describe('useJoin', () => {
  beforeEach(() => vi.mocked(isStandalone).mockReturnValue(false));

  afterEach(() => window.history.replaceState(null, '', '/'));

  it('reads the email from the URL fragment and clears it', () => {
    window.history.replaceState(null, '', '/join?x=1#email=jess%40example.com');

    const { result } = renderHook(() => useJoin());

    expect(result.current.email).toBe('jess@example.com');
    expect(window.location.hash).toBe('');
    expect(window.location.pathname + window.location.search).toBe('/join?x=1');
  });

  it('has no email without a fragment', () => {
    window.history.replaceState(null, '', '/join');

    expect(renderHook(() => useJoin()).result.current.email).toBeUndefined();
  });

  it('shows the install hint outside the installed app and lets it be dismissed', () => {
    const { result } = renderHook(() => useJoin());
    expect(result.current.showHint).toBe(true);

    act(() => result.current.dismissHint());

    expect(result.current.showHint).toBe(false);
  });

  it('hides the install hint inside the installed app', () => {
    vi.mocked(isStandalone).mockReturnValue(true);

    expect(renderHook(() => useJoin()).result.current.showHint).toBe(false);
  });
});
