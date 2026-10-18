import { redirect } from '@tanstack/react-router';
import { SessionStatus } from '../../../../services/session/constants';
import type { RequireSessionArgs } from './types';

export const requireSession = async ({ context, location }: RequireSessionArgs) => {
  if (context.session.getStatus() === SessionStatus.Loading) {
    await context.session.refresh();
  }
  if (context.session.getStatus() !== SessionStatus.SignedIn) {
    throw redirect({ to: '/sign-in', search: { redirect: location.href } });
  }
};
