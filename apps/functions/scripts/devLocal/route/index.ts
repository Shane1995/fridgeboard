import { API_PATHS } from '@fridgeboard/contract/auth/constants';
import { handler as households } from '../../../src/handlers/households/index.ts';
import { handler as me } from '../../../src/handlers/me/index.ts';
import { handler as username } from '../../../src/handlers/username/index.ts';
import { refresh } from '../authStubs/refresh/index.ts';
import { signOut } from '../authStubs/signOut/index.ts';
import { start } from '../authStubs/start/index.ts';
import { verify } from '../authStubs/verify/index.ts';
import type { RouteEntry } from './types.ts';

// Add a Lambda here to serve it locally. Passkey routes are deliberately absent: they 404.
export const ROUTES: ReadonlyMap<string, RouteEntry> = new Map<string, RouteEntry>([
  [`GET ${API_PATHS.me}`, { jwt: true, handler: me }],
  ['PUT /api/v1/me/username', { jwt: true, handler: username }],
  ['POST /api/v1/households', { jwt: true, handler: households }],
  [`POST ${API_PATHS.start}`, { jwt: false, handler: start }],
  [`POST ${API_PATHS.verify}`, { jwt: false, handler: verify }],
  [`POST ${API_PATHS.refresh}`, { jwt: false, handler: refresh }],
  [`POST ${API_PATHS.signOut}`, { jwt: false, handler: signOut }],
]);
