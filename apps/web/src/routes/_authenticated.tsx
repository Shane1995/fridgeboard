import { createFileRoute, Outlet } from '@tanstack/react-router';
import { requireSession } from '../app/router/utils/requireSession';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: requireSession,
  component: Outlet,
});
