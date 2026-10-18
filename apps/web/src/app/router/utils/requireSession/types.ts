import type { RouterContext } from '../../types';

export type RequireSessionArgs = {
  context: Pick<RouterContext, 'session'>;
  location: { href: string };
};
