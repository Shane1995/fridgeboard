import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import { HOME_COPY } from './constants';

export function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="font-hand text-6xl text-accent">{HOME_COPY.title}</h1>
      <p className="text-lg">{HOME_COPY.tagline}</p>
      <Button isDisabled>
        <Plus aria-hidden size={18} />
        {HOME_COPY.addItem}
      </Button>
    </main>
  );
}
