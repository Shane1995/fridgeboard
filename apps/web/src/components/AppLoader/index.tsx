import { Spinner } from '@heroui/react';
import { APP_LOADER_COPY } from './constants';

export const AppLoader = () => {
  return (
    <div
      role="status"
      aria-label={APP_LOADER_COPY.label}
      className="flex min-h-dvh items-center justify-center"
    >
      <Spinner size="lg" />
    </div>
  );
};
