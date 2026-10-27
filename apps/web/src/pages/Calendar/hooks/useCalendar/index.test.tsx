import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { TEST_WEB_CONFIGURATION } from '../../../../testUtils/webConfiguration';
import { createSession } from '../../../../testUtils/createSession';
import { TestProviders } from '../../../../testUtils/TestProviders';
import { SessionStatus } from '../../../../services/session/constants';
import { CalendarView } from '../../constants';
import { useCalendar } from '.';

const { session } = createSession(SessionStatus.SignedIn);

const config = {
  ...TEST_WEB_CONFIGURATION,
  featureFlags: { ...TEST_WEB_CONFIGURATION.featureFlags, [WebFeatureFlag.ENABLE_CALENDAR]: true },
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders session={session} config={config}>
    {children}
  </TestProviders>
);

describe('useCalendar', () => {
  it('reads the feature flag', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper });
    expect(result.current.enabled).toBe(true);
  });

  it('steps a month in month view and a week in week view', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper });
    const start = result.current.anchor;
    act(() => result.current.step({ direction: 1 }));
    expect(result.current.anchor.slice(0, 7)).not.toBe(start.slice(0, 7));

    act(() => result.current.goToday());
    act(() => result.current.setView(CalendarView.Week));
    act(() => result.current.step({ direction: 1 }));
    expect(Date.parse(result.current.anchor) - Date.parse(start)).toBe(7 * 86_400_000);
  });

  it('selects a day', () => {
    const { result } = renderHook(() => useCalendar(), { wrapper });
    act(() => result.current.selectDay({ date: '2030-01-05' }));
    expect(result.current.anchor).toBe('2030-01-05');
  });
});
