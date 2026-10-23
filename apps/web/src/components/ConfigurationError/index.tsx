import { Button } from '@heroui/react';
import { CONFIGURATION_ERROR_COPY } from './constants';
import type { ConfigurationErrorProps } from './types';

export const ConfigurationError = ({ onRetry }: ConfigurationErrorProps) => (
  <main
    role="alert"
    className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center"
  >
    <h1 className="text-2xl">{CONFIGURATION_ERROR_COPY.title}</h1>
    <p>{CONFIGURATION_ERROR_COPY.body}</p>
    <Button onPress={onRetry}>{CONFIGURATION_ERROR_COPY.retry}</Button>
  </main>
);
