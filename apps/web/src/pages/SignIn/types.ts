import type { ReactNode } from 'react';

export type SignInProps = {
  initialEmail?: string | undefined;
  redirectTo: string;
  children?: ReactNode;
};
