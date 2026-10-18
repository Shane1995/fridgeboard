# Code Standards

TypeScript, Node and React standards for Fridgeboard. Apply every rule to any code you write, touch, or review.

`apps/web/src/pages/Home/` is the reference implementation for now. When in doubt, copy its shape.

## File layout

1. **Every unit of code lives at `<dir>/<Name>/index.ts(x)`**, with its siblings:
   - tests: `<Name>/index.test.ts(x)`
   - types: `<Name>/types.ts`
   - constants: `<Name>/constants.ts`
2. **Types go in the co-located `types.ts`**, never inline in `index.ts(x)`. Local types use unprefixed names (`ReviewItem`, `CategoryRowProps`). The `I` prefix is reserved for types re-exported from a shared types package (`@fridgeboard/contract`). If a type is consumed outside its own directory, import it from that directory's `types.ts` directly; never re-export it from `index.ts`.
3. **Constants and magic strings go in the co-located `constants.ts`** (e.g. `HOME_COPY` in `pages/Home/constants.ts`).
4. **One function per component file.** Helpers move to a sibling `hooks/` (stateful) or `utils/` (pure) directory.
5. **Sub-components live in a co-located `components/` directory:**
   - used by one parent → `<Parent>/components/<Name>/`
   - shared by siblings → the lowest common ancestor's `components/<Name>/`. Example: `ShoppingList/components/ItemCheckbox/` shared by `ItemRow` and `BucketRow`, whereas `ShoppingList/ItemRow/components/ItemMenu/` is used only by `ItemRow`.

## Web layout

`apps/web/src` is split by role. Create a folder only when a unit lands in it.

| Folder        | Holds                                    |
| ------------- | ---------------------------------------- |
| `app/`        | framework wiring (router instance, route tree, devtools, providers' singletons) |
| `pages/`      | full screens                             |
| `components/` | reusable UI shared across pages          |
| `routes/`     | TanStack file routes (thin)              |
| `services/`   | I/O (API client, session)                |
| `hooks/`      | React hooks                              |
| `utils/`      | pure helpers                             |

- `routes/` holds TanStack file routes, named by router convention (`__root.tsx`, `index.tsx`, `join.tsx`, `_authenticated.tsx`, `_authenticated/...`). This is the one exception to `<Name>/index.tsx`.
- Route files stay thin: `createFileRoute`, `beforeLoad`, `loader` (via `queryClient.ensureQueryData`), `validateSearch`, and the page component imported from `pages/`.
- Server data goes through TanStack Query, only via the `hooks/useQuery` and `hooks/useMutation` wrappers.
- Navigation uses typed `<Link>` and `useNavigate`, never string `href`s for internal routes.
- `components/App` is the root component (providers + `RouterProvider`).
- **`services/` must not import React, TanStack React packages or any UI-framework package (type-only imports excepted).** Framework bindings go in `app/`, `hooks/` or `components/`. Enforced by oxlint `no-restricted-imports`.
- The generated route tree lives at `app/router/routeTree.gen.ts`; it is committed and never hand-edited.

## Types

6. **Use a real TS `enum` for a fixed set of values**, not an `as const` object literal. The exception is values that cross a boundary: anything persisted (DynamoDB) or sent over the wire (HTTP API, AppSync Events). Those stay a string union or an `as const` object.
7. **Fix the underlying types instead of using `as` assertions** in any code you touch. For example, add an explicit annotation so enum members aren't widened.

## Style

8. **Use `const` and build new arrays/objects** rather than using `let` or mutating in place.

## Exports

- **Named exports only.** No `export default`. Exceptions are config files a tool loads by default export: `apps/web/vite.config.ts`, `apps/web/vitest.config.ts`, `apps/functions/vitest.config.ts`, `commitlint.config.cjs`, and any other root or app config. They are listed in the `.oxlintrc.json` `overrides`.
- **Functions and components are `export const name = (…): Ret => …`.** No `function` declarations. Recursive functions are `const` arrows that reference themselves. Lambda handlers are `export const handler = async (…) => …`.
- **No barrel files.** `<Name>/index.ts(x)` holds that unit's implementation only and never re-exports. Import types from `<Name>/types.ts` and constants from `<Name>/constants.ts` directly.
- **Shared packages expose subpaths via `package.json` `exports`, not an index barrel.** Example: `@fridgeboard/contract/auth`, `@fridgeboard/contract/auth/constants`, `@fridgeboard/contract/me`.
- `React.lazy` maps the named export: `lazy(() => import('./X').then((m) => ({ default: m.X })))`.
- Enforced by oxlint: `import/no-default-export`, `func-style` (`"expression"`), `oxc/no-barrel-file` (threshold 0). The barrel rule only detects `export * from`, so named re-exports (`export { x } from`) are caught in review.

## Tests

9. **Every hook and util has `index.test.ts` coverage.** Extracting one keeps or adds its tests.

## Tooling baseline

The repo's root config files are the source of truth:

- pnpm workspaces + Turborepo, Node ≥ 24
- Vitest
- oxfmt (`.oxfmtrc.json`) + oxlint, run through lint-staged
- Husky pre-commit + commitlint (conventional commits)
- fallow for code health (`.fallowrc.json`)
- Server data: TanStack Query via `hooks/useQuery` / `hooks/useMutation` wrappers only
- UI: Tailwind CSS 4, HeroUI v3 (`@heroui/react`), Lucide icons. No global state library: React Context where needed, `useState` otherwise
