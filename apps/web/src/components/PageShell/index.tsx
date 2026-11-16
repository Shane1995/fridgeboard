import { PageHeader } from '../PageHeader';
import type { PageShellProps } from './types';

// The frame every signed-in page shares: one width, one padding, and the same header in the same
// place, so moving between pages never shifts the title.
export const PageShell = ({ title, children }: PageShellProps) => (
  <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4 md:p-6">
    <PageHeader title={title} />
    {children}
  </main>
);
