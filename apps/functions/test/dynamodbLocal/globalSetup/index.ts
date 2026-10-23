import { execFileSync } from 'node:child_process';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { COMPOSE_SERVICE, ENDPOINT, REGION } from '../constants.ts';
import { createTable } from '../createTable/index.ts';

const isReachable = async (): Promise<boolean> => {
  try {
    await fetch(ENDPOINT, { signal: AbortSignal.timeout(1_000) });
    return true;
  } catch {
    return false;
  }
};

export const setup = async (): Promise<() => void> => {
  const startedHere = !(await isReachable());
  if (startedHere) {
    execFileSync('docker', ['compose', 'up', '--detach', '--wait', COMPOSE_SERVICE], {
      stdio: 'inherit',
    });
  }
  await createTable(
    new DynamoDBClient({
      endpoint: ENDPOINT,
      region: REGION,
      credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
    }),
  );
  return () => {
    if (startedHere) {
      execFileSync('docker', ['compose', 'down'], { stdio: 'inherit' });
    }
  };
};
