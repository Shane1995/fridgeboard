# CLAUDE.md

Fridgeboard: a PWA for Shane and his wife to share a shopping list and her work shifts, replacing the fridge calendar. Serverless on AWS, DNS on Cloudflare, Terraform in HCP.

## Read first

- **Design (source of truth):** `~/Obsidian/Brain/Claude/Plans/fridgeboard-design.md`
- **Project state:** `~/Obsidian/Brain/Claude/Projects/fridgeboard.md`
- **Code standards:** follow every rule in [`CODE_STANDARDS.md`](CODE_STANDARDS.md) (this folder) for all TS/Node/React code, including its tooling baseline.
- **Design pack** (palette, type, user flow, screens per feature, notifications): `~/Obsidian/Brain/Claude/Plans/fridgeboard-design-pack.html`. Implement it as a HeroUI v3 theme: primary Tomato #E2462F, success Mint #26A383, warning Mustard #EDB02B, foreground Biro ink #1D2B3A, background Enamel #F4F6F3; fonts Figtree (UI) and Caveat (logo/empty states only).
- **Solution pack** (architecture, stack, security, risks, cost): `~/Obsidian/Brain/Claude/Plans/fridgeboard-solution-pack.html`. Keep cost near zero and state £/month for any new service.

## Where things live

| What | Where |
|---|---|
| App code (PWA + Lambdas) | this repo; no Terraform here |
| App infra (AWS + Cloudflare DNS) | `~/Dev/terraform-cloud-infra/projects/fridgeboard/production`, HCP org `Avocados`, project `fridgeboard`, workspace `fridgeboard-aws-production` |
| AWS account `fridgeboard` (089475198576), budget, HCP OIDC role, SSO | `~/Dev/terraform-cloud-infra/foundation/aws-organization`, HCP Avocados / `foundation` / `aws-organization` |
| Domain | `fridgeboard.uk` on Cloudflare: `app.` = PWA, `api.` = API, apex redirects to `app.` |
| Region | `eu-west-2` |

## Tickets

Work is tracked on Trello: https://trello.com/b/F38XamqH/fridgeboard (board id `6ad38f237bd748ee07e1c836`). Use the `trello-query` skill's credentials with this board id, **not** its default reyogo board.

- Lists: **Bugs**, **Ready** (all blockers done), **Todo** (blocked), **In Progress**, **Done**.
- Each card has a description with "What to build" and "Blocked by", plus an "Acceptance criteria" checklist.
- To work a ticket: pick from **Ready** and move it to **In Progress**. Done means every acceptance item is ticked and verified. Then move it to **Done**, and move any card whose blockers are now all done from **Todo** to **Ready**.
- Cards labelled **Manual (Shane)** are Shane's to do by hand. Guide him through them; don't do them yourself.

## Working rules

- Plans, specs, and design changes go in the Obsidian vault (`~/Obsidian/Brain/Claude/Plans/`), never in this repo. Update the design doc when a decision changes.
- Keep running costs near zero: no NAT gateways, RDS, or always-on compute.
- Capture lessons and project-state changes in the vault via the `vault` skill.
