import { act, renderHook } from '@testing-library/react';
import { usePasskeyDevice } from '.';

describe('usePasskeyDevice', () => {
  afterEach(() => window.localStorage.clear());

  it('starts empty on a new device', () => {
    const { result } = renderHook(() => usePasskeyDevice());

    expect(result.current.email).toBeUndefined();
    expect(result.current.promptDismissed).toBe(false);
  });

  it('reads what an earlier visit stored', () => {
    window.localStorage.setItem('fb:passkey-email', 'jess@example.com');
    window.localStorage.setItem('fb:passkey-prompt-dismissed', '1');

    const { result } = renderHook(() => usePasskeyDevice());

    expect(result.current.email).toBe('jess@example.com');
    expect(result.current.promptDismissed).toBe(true);
  });

  it('remembers the email and persists it', () => {
    const { result } = renderHook(() => usePasskeyDevice());

    act(() => result.current.remember('jess@example.com'));

    expect(result.current.email).toBe('jess@example.com');
    expect(window.localStorage.getItem('fb:passkey-email')).toBe('jess@example.com');
  });

  it('forgets the email', () => {
    window.localStorage.setItem('fb:passkey-email', 'jess@example.com');
    const { result } = renderHook(() => usePasskeyDevice());

    act(() => result.current.forget());

    expect(result.current.email).toBeUndefined();
    expect(window.localStorage.getItem('fb:passkey-email')).toBeNull();
  });

  it('remembers that the prompt was dismissed', () => {
    const { result } = renderHook(() => usePasskeyDevice());

    act(() => result.current.dismissPrompt());

    expect(result.current.promptDismissed).toBe(true);
    expect(window.localStorage.getItem('fb:passkey-prompt-dismissed')).toBe('1');
  });
});
