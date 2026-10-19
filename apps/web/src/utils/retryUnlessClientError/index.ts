import { CLIENT_ERROR_MAX, CLIENT_ERROR_MIN } from './constants';

const isClientError = (error: Error): boolean =>
  typeof error.cause === 'number' &&
  error.cause >= CLIENT_ERROR_MIN &&
  error.cause <= CLIENT_ERROR_MAX;

export const retryUnlessClientError =
  (count: number) =>
  (failureCount: number, error: Error): boolean =>
    failureCount < count && !isClientError(error);
