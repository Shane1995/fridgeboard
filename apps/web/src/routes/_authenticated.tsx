import { createFileRoute, Outlet } from '@tanstack/react-router';
import { RealtimeProvider } from '../Context/Realtime';
import { AppNav } from '../components/AppNav';
import { PasskeyPrompt } from '../components/PasskeyPrompt';
import { RequireSession } from '../components/RequireSession';
import { RequireOnboarding } from '../components/RequireOnboarding';

export const Route = createFileRoute('/_authenticated')({
  component: () => (
    <RequireSession>
      <RequireOnboarding>
        <RealtimeProvider>
          <AppNav />
          <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
            <Outlet />
          </div>
        </RealtimeProvider>
      </RequireOnboarding>
      <PasskeyPrompt />
    </RequireSession>
  ),
});
