import { execFileSync } from 'node:child_process';

execFileSync('docker', ['compose', 'down', '--volumes'], { stdio: 'inherit' });
console.log('Local DynamoDB data deleted. `pnpm dev:local` reseeds it.');
