import { createFileRoute, redirect } from '@tanstack/react-router';

// Profile became Settings; this keeps bookmarks and installed home-screen links working.
export const Route = createFileRoute('/_authenticated/profile')({
  beforeLoad: () => {
    throw redirect({ to: '/settings' });
  },
});
