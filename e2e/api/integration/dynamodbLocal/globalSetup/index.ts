import { execFileSync } from 'node:child_process';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { COMPOSE_SERVICE, ENDPOINT, REGION, TABLE_NAME } from '../constants.ts';
import { createTable } from '../../../../../apps/functions/scripts/devLocal/createTable/index.ts';

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
    TABLE_NAME,
  );
  return () => {
    if (startedHere) {
      execFileSync('docker', ['compose', 'rm', '--stop', '--force', COMPOSE_SERVICE], {
        stdio: 'inherit',
      });
    }
  };
};
