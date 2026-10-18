export const runCli = async (task: () => Promise<void>): Promise<void> => {
  try {
    await task();
  } catch (error: unknown) {
    console.error(error instanceof Error ? `${error.name}: ${error.message}` : 'Unknown error');
    process.exitCode = 1;
  }
};
