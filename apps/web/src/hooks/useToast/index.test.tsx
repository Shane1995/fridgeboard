import { renderHook } from '@testing-library/react';
import { useToast } from './index';

describe('useToast', () => {
  it('does nothing, and does not throw, when there is no provider', () => {
    const { result } = renderHook(() => useToast());

    expect(() => {
      result.current.success('Saved');
      result.current.error('Failed');
      result.current.confirm({ title: 'Sure?', actions: [] });
    }).not.toThrow();
  });
});
