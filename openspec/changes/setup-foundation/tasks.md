# Tasks

## 1. Monorepo scaffold (T-00-01)

- [x] 1.1 Add root `package.json` (`packageManager`, scripts `dev|build|lint|typecheck|test|test:int|e2e|codegen`), `pnpm-workspace.yaml`, `turbo.json`, `.npmrc`, `.editorconfig`; add `turbo` (dev, ask first). Verify `pnpm install` completes with no missing-workspace warnings
- [x] 1.2 Add placeholder `package.json` for `apps/{web,api,insights-worker}` and `packages/{domain,events,config}`. Verify `pnpm turbo run build lint typecheck test` exits 0
- [x] 1.3 Extend `.gitignore` (`.env`, `node_modules`, `dist`, `coverage`, generated GraphQL) and confirm `.nvmrc` pins 22. Verify with `git status` after creating those paths
- [x] 1.4 Add `.env.example` with a comment and non-secret placeholder per variable. Verify by reading it

## 2. Shared config: tsconfig, ESLint, Prettier (T-00-02)

- [ ] 2.1 Add `packages/config` with `tsconfig.base.json` (strict flags from design), `tsconfig.node.json`, `tsconfig.react.json`; add typescript (ask first). Verify `pnpm typecheck` passes for every workspace
- [ ] 2.2 Add shared ESLint flat config with typescript-eslint, react-hooks, jsx-a11y and prettier compat (ask first). Verify a temporary `any` fixture errors, then remove it
- [ ] 2.3 Add the `packages/domain` import restriction. Verify a temporary `import mongoose` fixture errors, then remove it
- [ ] 2.4 Add Prettier and `pnpm format` / `format:check`. Verify `format:check` fails on a misformatted file
- [ ] 2.5 Decide and document internal package consumption in CLAUDE.md. Verify another workspace can import a package type

## 3. Domain package + Vitest (T-00-03)

- [ ] 3.1 Add `packages/domain` with `Clock` and `systemClock`; add vitest + @vitest/coverage-v8 (ask first). Verify `clock.test.ts` passes via `pnpm test`
- [ ] 3.2 Enable coverage reporting (no threshold yet). Verify `pnpm test -- --coverage` writes `coverage/` (git-ignored)

## 4. Events package skeleton (T-00-04)

- [ ] 4.1 Add `packages/events` envelope, event types, payload schemas (`.strict()`) and `TOPICS` with a type→topic map; add zod (ask first, check the v4 API). Verify unit tests for every type and the map's completeness
- [ ] 4.2 Add `parseEvent(raw: unknown)` returning a discriminated result. Verify tests for valid, unknown-type, missing-id, extra-key and wrong-version messages
- [ ] 4.3 Add the payload allow-list test. Verify adding `rpe` to a payload makes it fail

## 5. Compose: Mongo replica set (T-00-05)

- [ ] 5.1 Add the `mongo` service (MongoDB 8, named volume, replica-set flags, cache cap, idempotent init healthcheck). Verify it is `healthy` within 30 s and `rs.status().ok === 1`
- [ ] 5.2 Verify a host-side two-collection transaction commits with `MONGO_URL`, and that `docker compose down -v && up` re-initialises; record the commands in the README

## 6. Compose: Kafka KRaft (T-00-06)

- [ ] 6.1 Add the `kafka` service (apache/kafka 4.x, KRaft, capped heap, host + internal listeners). Verify it is healthy within 60 s at ≤ ~700 MB RAM
- [ ] 6.2 Add `kafka-init` and `infra/kafka/create-topics.sh`. Verify the 4 topics exist with 3 partitions and 7-day retention, and a rerun is a no-op
- [ ] 6.3 Verify a keyed console produce/consume works from host and container; record the commands in the README

## 7. API hello GraphQL + codegen (T-00-07)

- [ ] 7.1 Add Apollo Server to `apps/api` with a schema-first `hello` query (ask first: @apollo/server, graphql). Verify a curl to `/graphql` returns the greeting
- [ ] 7.2 Add GraphQL Code Generator and `pnpm codegen` producing typed resolvers (ask first). Verify a resolver type error fails `pnpm typecheck`
- [ ] 7.3 Add a zod env schema with fail-fast startup. Verify the API exits with a message naming a missing `MONGO_URL`

## 8. API health + logging (T-00-08)

- [ ] 8.1 Add `GET /health` and `GET /health/ready` (Mongo ping). Verify 200 when up and 503 naming the dependency when Mongo is stopped
- [ ] 8.2 Add pino with request ids, redact paths and a serializer that drops GraphQL variables and args (ask first: pino). Verify a log-capture unit test shows `rpe`/`notes` values never appear

## 9. Web hello (Vite + Apollo) (T-00-09)

- [ ] 9.1 Scaffold `apps/web` with Vite + React + TS (ask first). Verify `pnpm dev` serves the page
- [ ] 9.2 Add Apollo Client and render the `hello` result with loading and error states. Verify the page shows the API greeting with the stack running

## 10. Compose full stack (T-00-10)

- [ ] 10.1 Add `api`, `insights-worker` (stub) and `web` services with healthchecks and `depends_on: service_healthy`. Verify `docker compose up` brings all services healthy from a fresh clone
- [ ] 10.2 Fill in README "Local setup" and CLAUDE.md "Commands" with the real scripts. Verify each documented command runs as written

## 11. CI skeleton (T-00-11)

- [ ] 11.1 Add `.github/workflows/ci.yml` running install, codegen, lint, typecheck, test and build on PRs with pnpm caching. Verify a green run on the PR
- [ ] 11.2 Verify a deliberate type error makes CI fail, then revert it

## Workflow follow-up

- Archive this change once every group is merged and the spec scenarios pass.
