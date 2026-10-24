import { Link } from '@tanstack/react-router';
import { ROUTER_COPY } from '../../app/router/constants';
import type { RouteFallbackProps } from './types';
import { Typography } from '../Typography';
import { TypographyVariant } from '../Typography/constants';

export const RouteFallback = ({ title }: RouteFallbackProps) => {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <Typography variant={TypographyVariant.Heading2} as="h1">
        {title}
      </Typography>
      <Link to="/">{ROUTER_COPY.home}</Link>
    </main>
  );
};
