import { ROUTER_COPY } from '../../app/router/constants';
import { RouteFallback } from '../../components/RouteFallback';
import { useStaleBuildRecovery } from '../../hooks/useStaleBuildRecovery';

export const RouteError = () => {
  useStaleBuildRecovery();
  return <RouteFallback title={ROUTER_COPY.error} />;
};
