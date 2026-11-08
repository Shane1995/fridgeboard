import { execFileSync } from 'node:child_process';
import { COMPOSE_FILE } from '../constants.ts';

execFileSync('docker', ['compose', '-f', COMPOSE_FILE, 'down', '--volumes'], { stdio: 'inherit' });
console.log('DynamoDB Local data deleted. `pnpm dev:local` reseeds it.');
