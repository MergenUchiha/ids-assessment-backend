# IDS Assessment Platform — Backend

Measures how effectively an intrusion-detection system (Suricata) catches
Metasploit attacks run against a victim inside an isolated lab. Each run
launches a scenario against the target, reads the alerts Suricata produced in
the same window, and records one cell of a confusion matrix; the platform
aggregates those into precision, recall, F1 and detection latency per
experiment.

Companion frontend:
[`ids-assessment-frontend`](https://github.com/MergenUchiha/ids-assessment-frontend).

## Stack

| | |
|---|---|
| Runtime | Node.js 20+ |
| Framework | NestJS 10 |
| Database | PostgreSQL via Prisma 5 |
| Queue | Bull on Redis |
| Auth | JWT (passport-jwt), bcrypt, a global guard |
| Lab | Docker — Suricata, a victim, and a Metasploit attacker |
| Docs | Swagger at `/docs` |

## Architecture

Two processes share the code:

- **API** (`npm run start`) — the HTTP server. Creating a run enqueues a Bull
  job and returns.
- **Runner** (`npm run start:runner`) — a queue worker with no HTTP server. It
  `docker exec`s the scenario into the attacker container, waits, reads
  `eve.json`, and writes alerts and metrics.

## Getting started

```bash
bun install                          # or npm install
cp .env.example .env                 # then fill in the required values
openssl rand -base64 48              # a JWT secret

# Postgres + Redis only:
POSTGRES_PASSWORD=<something> docker compose -f docker-compose.infra.yml up -d

npx prisma migrate dev               # apply migrations
npm run prisma:seed                  # admin account + demo experiments
npm run start:dev                    # API on http://localhost:3000

# In a second terminal, once the lab is up (see below):
npm run start:runner
```

The full lab — database, queue, Suricata, victim and attacker on an isolated
network — comes up with:

```bash
POSTGRES_PASSWORD=<something> docker compose up -d
```

### Environment

Every variable is validated on boot; the process stops with a readable message
rather than failing later. See [`.env.example`](.env.example).

| Variable | Required | Default | Purpose |
|---|:---:|---|---|
| `DATABASE_URL` | yes | — | PostgreSQL connection string |
| `NODE_ENV` | no | `development` | `development`, `test`, `production` |
| `PORT` | no | `3000` | HTTP port |
| `JWT_SECRET` | yes | — | Token signing key, minimum 32 characters |
| `JWT_EXPIRES_IN` | no | `12h` | Token lifetime |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | seeding | — | The account the seeder creates (password ≥ 12) |
| `REDIS_HOST` / `REDIS_PORT` | no | `localhost` / `6379` | Bull's Redis |
| `CORS_ORIGINS` | no | localhost dev origins | Comma-separated allowed origins |
| `SWAGGER_ENABLED` | no | on outside production | Serves `/docs` |
| `LAB_ATTACKER_CONTAINER` | no | `ids_attacker` | Container the runner execs into |
| `LAB_VICTIM_HOST` | no | `victim` | Target hostname inside the lab network |
| `EVE_JSON_PATH` | no | `./artifacts/suricata/eve.json` | Where Suricata writes alerts |

## Accounts

There is no public registration. The first account comes from the seeder;
further accounts are created through `POST /auth/users`, which requires an
existing token — an account here can launch a Metasploit run, so it is not
something an anonymous caller should be able to create.

Every route requires a bearer token except `POST /auth/login`.

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Exchange credentials for a JWT (public) |
| POST | `/auth/users` | Create an account |
| GET | `/auth/users` | List accounts |
| GET/POST/DELETE | `/experiments…` | Experiments |
| GET | `/experiments/:id/summary` | Aggregated precision, recall, F1, latency |
| GET/POST/DELETE | `/scenarios…` | Attack scenarios |
| GET/POST/DELETE | `/ids-profiles…` | IDS rulesets |
| POST | `/runs/:experimentId/:scenarioId` | Queue a run (`{ "isBaseline": true }` for a baseline) |
| GET | `/runs/:id`, `/runs/:id/report`, `/runs/:id/alerts` | Read a run |
| GET | `/alerts` | Recent alerts across all runs |

## How a run is measured

Suricata writes an alert per matching packet to `eve.json`. After the attack,
the runner reads the alerts in the run's time window and, if the scenario
lists expected signatures, keeps only those.

Each run contributes one cell of a confusion matrix, keyed on **whether an
attack was launched** — not on whether the exploit succeeded:

| | alert raised | no alert |
|---|---|---|
| attack run | true positive | false negative |
| baseline (no attack) | false positive | true negative |

A **baseline** run (`isBaseline: true`) carries no attack, so any alert it
triggers is a false positive; without baseline runs, the false-positive rate
cannot be measured at all. Precision, recall and F1 mean nothing on a single
run — they can only be 0 or 1 — so they are computed across an experiment by
`GET /experiments/:id/summary`, not stored on each run.

## The lab and command safety

The runner drives a Metasploit container over `docker exec` with a validated
argument vector — no shell. A scenario's `msfModule` reaches `msfconsole -x`,
so it is checked against a strict allow-list pattern
(`auxiliary/exploit/... module paths only`, no spaces, quotes or shell
metacharacters) both at the API boundary and again in the runner before it is
used. The lab network is `internal`, with no route to the host.

## Scripts

```bash
npm run build          # tsc -> dist/main.js
npm run start:dev      # API in watch mode
npm run start:runner   # the queue worker
npm run start:prod     # node dist/main
npm run lint           # ESLint with type-aware rules
npm run prisma:migrate # apply migrations
npm run prisma:seed    # admin account and demo data
npm run db:up          # Postgres + Redis via compose
```

## Known limitations

* **No automated tests.** Correctness was checked by building, linting and
  running the API end to end against the seeded database.
* **Tokens cannot be revoked before they expire.** There is no refresh token
  and no session store; a deleted account is cut off at once because the
  account is looked up on every request.
* **No rate limiting** on login.
* **The runner needs the Docker socket** to `docker exec` into the lab, which
  is a privileged dependency; it is meant to run on the lab host, not exposed.
* **Alerts are matched by time window and signature**, not by flow, so a busy
  sensor could attribute an unrelated alert to a run.

## Licence

UNLICENSED — coursework project.
