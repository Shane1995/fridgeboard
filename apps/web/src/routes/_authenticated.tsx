import { createFileRoute, Outlet } from '@tanstack/react-router';
import { RequireSession } from '../components/RequireSession';
import { RequireOnboarding } from '../components/RequireOnboarding';

export const Route = createFileRoute('/_authenticated')({
  component: () => (
    <RequireSession>
      <RequireOnboarding>
        <Outlet />
      </RequireOnboarding>
    </RequireSession>
  ),
});
