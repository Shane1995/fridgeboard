import { RouterProvider } from '@tanstack/react-router';
import { router } from '../../app/router';
import { useRouterContext } from '../../hooks/useRouterContext';

export const AppRouter = () => <RouterProvider router={router} context={useRouterContext()} />;
