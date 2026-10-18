import { createFileRoute } from '@tanstack/react-router';
import { ME_QUERY_KEY } from '../../hooks/useMeQuery/constants';
import { Home } from '../../pages/Home';
import { getMe } from '../../services/api/getMe';

export const Route = createFileRoute('/_authenticated/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({ queryKey: ME_QUERY_KEY, queryFn: getMe }),
  component: Home,
});
