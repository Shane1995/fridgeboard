import { createFileRoute, Outlet } from '@tanstack/react-router';
import { RequireSession } from '../components/RequireSession';
import { RequireUsername } from '../components/RequireUsername';

export const Route = createFileRoute('/_authenticated')({
  component: () => (
    <RequireSession>
      <RequireUsername>
        <Outlet />
      </RequireUsername>
    </RequireSession>
  ),
});
