import { UNKNOWN_ERROR } from './constants.ts';

export const runCli = async (task: () => Promise<void>): Promise<void> => {
  try {
    await task();
  } catch (error: unknown) {
    console.error(error instanceof Error ? `${error.name}: ${error.message}` : UNKNOWN_ERROR);
    process.exitCode = 1;
  }
};
