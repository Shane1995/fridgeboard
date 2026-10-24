import { WebService } from '../../../../web/src/services/configuration/schema/constants.ts';
import type { ApiService } from '../../../../web/src/services/configuration/schema/types.ts';
import { handler as households } from '../../../src/handlers/households/index.ts';
import { handler as myHouseholds } from '../../../src/handlers/myHouseholds/index.ts';
import { handler as me } from '../../../src/handlers/me/index.ts';
import { handler as onboarding } from '../../../src/handlers/onboarding/index.ts';
import { handler as username } from '../../../src/handlers/username/index.ts';
import { refresh } from '../authStubs/refresh/index.ts';
import { signOut } from '../authStubs/signOut/index.ts';
import { start } from '../authStubs/start/index.ts';
import { verify } from '../authStubs/verify/index.ts';
import type { RouteDefinition, RouteEntry } from './types.ts';

// Add a Lambda here to serve it locally. The path comes from the served configuration, so it
// cannot drift from what the web app calls. Passkey services are left out and 404.
const DEFINITIONS: RouteDefinition[] = [
  { method: 'GET', service: WebService.me, jwt: true, handler: me },
  { method: 'GET', service: WebService.onboarding, jwt: true, handler: onboarding },
  { method: 'PUT', service: WebService.username, jwt: true, handler: username },
  { method: 'GET', service: WebService.households, jwt: true, handler: myHouseholds },
  { method: 'POST', service: WebService.households, jwt: true, handler: households },
  { method: 'POST', service: WebService.requestCode, jwt: false, handler: start },
  { method: 'POST', service: WebService.verify, jwt: false, handler: verify },
  { method: 'POST', service: WebService.refresh, jwt: false, handler: refresh },
  { method: 'POST', service: WebService.signOut, jwt: false, handler: signOut },
];

export const buildRoutes = (api: ApiService): ReadonlyMap<string, RouteEntry> =>
  new Map(
    DEFINITIONS.map(({ method, service, jwt, handler }): [string, RouteEntry] => [
      `${method} ${api.endpoints[service]}`,
      { jwt, handler },
    ]),
  );
