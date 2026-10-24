import { act, renderHook } from '@testing-library/react';
import { useLocalStorage } from './index';

describe('useLocalStorage', () => {
  afterEach(() => window.localStorage.clear());

  it('starts with what an earlier visit stored', () => {
    window.localStorage.setItem('k', 'v');

    const { result } = renderHook(() => useLocalStorage('k'));

    expect(result.current[0]).toBe('v');
  });

  it('starts empty when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('k'));

    expect(result.current[0]).toBeUndefined();
  });

  it('stores and clears the value', () => {
    const { result } = renderHook(() => useLocalStorage('k'));

    act(() => result.current[1]('v'));
    expect(result.current[0]).toBe('v');
    expect(window.localStorage.getItem('k')).toBe('v');

    act(() => result.current[1](undefined));
    expect(result.current[0]).toBeUndefined();
    expect(window.localStorage.getItem('k')).toBeNull();
  });
});
