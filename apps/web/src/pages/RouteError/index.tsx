import { ROUTER_COPY } from '../../app/router/constants';
import { RouteFallback } from '../../components/RouteFallback';

export const RouteError = () => {
  return <RouteFallback title={ROUTER_COPY.error} />;
};
