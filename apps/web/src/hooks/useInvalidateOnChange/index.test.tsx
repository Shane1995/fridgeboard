import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RealtimeContext } from '../../Context/Realtime/context';
import { QueryName } from '../../services/configuration/schema/constants';
import { useInvalidateOnChange } from '.';

const TYPES = ['item'] as const;
const KEYS = [QueryName.items, QueryName.suggestions] as const;

describe('useInvalidateOnChange', () => {
  it('registers the types and keys while mounted and stops when it goes away', () => {
    const unregister = vi.fn();
    const invalidateOn = vi.fn(() => unregister);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <RealtimeContext.Provider value={{ subscribe: vi.fn(), invalidateOn }}>
        {children}
      </RealtimeContext.Provider>
    );

    const { unmount } = renderHook(() => useInvalidateOnChange({ types: TYPES, keys: KEYS }), {
      wrapper,
    });

    expect(invalidateOn).toHaveBeenCalledOnce();
    expect(invalidateOn).toHaveBeenCalledWith({ types: TYPES, keys: KEYS });
    unmount();
    expect(unregister).toHaveBeenCalledOnce();
  });
});
