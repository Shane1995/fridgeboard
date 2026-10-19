import { createFileRoute, Outlet } from '@tanstack/react-router';
import { RequireSession } from '../components/RequireSession';

export const Route = createFileRoute('/_authenticated')({
  component: () => (
    <RequireSession>
      <Outlet />
    </RequireSession>
  ),
});
