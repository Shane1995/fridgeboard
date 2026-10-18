import { Link } from '@tanstack/react-router';
import { ROUTER_COPY } from '../../services/router/constants';
import type { RouteFallbackProps } from './types';

export function RouteFallback({ title }: RouteFallbackProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl">{title}</h1>
      <Link to="/">{ROUTER_COPY.home}</Link>
    </main>
  );
}
