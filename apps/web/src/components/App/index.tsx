import { RouterProvider } from '@tanstack/react-router';
import { router } from '../../app/router';
import { GlobalContextProvider } from '../../Context/Global';

export const App = () => (
  <GlobalContextProvider>
    <RouterProvider router={router} />
  </GlobalContextProvider>
);
