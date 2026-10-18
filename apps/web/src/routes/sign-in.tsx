import { createFileRoute } from '@tanstack/react-router';
import { SignIn } from '../pages/SignIn';
import { sanitizeRedirect } from '../utils/sanitizeRedirect';

export const Route = createFileRoute('/sign-in')({
  validateSearch: (search: { redirect?: unknown }) => ({
    redirect: sanitizeRedirect(search.redirect),
  }),
  component: () => <SignIn redirectTo={Route.useSearch().redirect} />,
});
